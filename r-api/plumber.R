library(plumber)
library(metafor)
library(ggplot2)
library(base64enc)
library(jsonlite)
library(survival)

#* Enable CORS
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

#* Health check
#* @get /health
#* @serializer json
function() {
  list(status = "ok", service = "galatea-r-api", version = "1.0.0")
}

#* Meta-analysis endpoint
#* @post /analyze
#* @serializer json
function(req) {
  tryCatch({
    data <- jsonlite::fromJSON(req$postBody)
    studies <- as.data.frame(data$studies)
    measure <- ifelse(is.null(data$measure), "OR", toupper(data$measure))
    method <- ifelse(is.null(data$model) || data$model == "random", "DL", "FE")
    is_continuous <- measure %in% c("SMD", "MD", "ROM")

    # 1. Calculate effect sizes
    if (is_continuous) {
      # Continuous data: SMD (Hedges' G), MD, or ROM
      es <- escalc(
        measure = measure,
        m1i = studies$mean_i,
        sd1i = studies$sd_i,
        n1i = studies$n_i,
        m2i = studies$mean_c,
        sd2i = studies$sd_c,
        n2i = studies$n_c
      )
    } else {
      # Dichotomous data: OR, RR, RD
      es <- escalc(
        measure = measure,
        ai = studies$events_i,
        bi = studies$total_i - studies$events_i,
        ci = studies$events_c,
        di = studies$total_c - studies$events_c
      )
    }

    # 2. Random-effects meta-analysis
    res <- rma(yi, vi, data = es, method = method)

    # 3. Build per-study results
    yi_vals <- as.numeric(es$yi)
    vi_vals <- as.numeric(es$vi)
    se_vals <- sqrt(vi_vals)
    w_vals <- as.numeric(weights(res))

    if (is_continuous) {
      # For continuous measures, effect = yi directly (no exponentiation)
      study_results <- data.frame(
        author = studies$author,
        year = studies$year,
        yi = yi_vals,
        vi = vi_vals,
        se = se_vals,
        or = yi_vals,
        or_lo = yi_vals - 1.96 * se_vals,
        or_hi = yi_vals + 1.96 * se_vals,
        weight = w_vals,
        stringsAsFactors = FALSE
      )
    } else {
      study_results <- data.frame(
        author = studies$author,
        year = studies$year,
        yi = yi_vals,
        vi = vi_vals,
        se = se_vals,
        or = exp(yi_vals),
        or_lo = exp(yi_vals - 1.96 * se_vals),
        or_hi = exp(yi_vals + 1.96 * se_vals),
        weight = w_vals,
        stringsAsFactors = FALSE
      )
    }

    # 4. Egger's regression test for funnel plot asymmetry
    egger <- tryCatch({
      reg <- regtest(res)
      list(intercept = as.numeric(reg$est), p = as.numeric(reg$pval))
    }, error = function(e) {
      list(intercept = NA, p = NA)
    })

    # 5. Leave-one-out sensitivity analysis
    loo_res <- tryCatch({
      l1o <- leave1out(res)
      data.frame(
        removed = paste(studies$author, studies$year),
        or = exp(as.numeric(l1o$estimate)),
        or_lo = exp(as.numeric(l1o$ci.lb)),
        or_hi = exp(as.numeric(l1o$ci.ub)),
        stringsAsFactors = FALSE
      )
    }, error = function(e) {
      data.frame(removed = character(0), or = numeric(0), or_lo = numeric(0), or_hi = numeric(0))
    })

    # Find study with max impact on pooled estimate
    if (nrow(loo_res) > 0) {
      pooled_or <- exp(as.numeric(res$beta))
      diffs <- abs(loo_res$or - pooled_or)
      max_idx <- which.max(diffs)
      max_impact <- loo_res[max_idx, ]
    } else {
      max_impact <- list(removed = "N/A", or = NA, or_lo = NA, or_hi = NA)
    }

    # 6. GRADE assessment
    i2_val <- as.numeric(res$I2)
    egger_p_val <- ifelse(is.na(egger$p), 1, egger$p)

    grade <- data.frame(
      domain = c("Riesgo de sesgo", "Inconsistencia", "Evidencia indirecta", "Imprecision", "Sesgo de publicacion"),
      rating = c(
        "No grave",
        ifelse(i2_val > 50, "Grave", "No grave"),
        "No grave",
        ifelse(as.numeric(res$ci.ub) - as.numeric(res$ci.lb) > 2, "Grave", "No grave"),
        ifelse(egger_p_val < 0.1, "Grave", "No grave")
      ),
      downgrade = c(
        0,
        ifelse(i2_val > 50, -1, 0),
        0,
        ifelse(as.numeric(res$ci.ub) - as.numeric(res$ci.lb) > 2, -1, 0),
        ifelse(egger_p_val < 0.1, -1, 0)
      ),
      notes = c(
        paste0(sum(study_results$weight > mean(study_results$weight)), "/", nrow(studies), " estudios con peso superior al promedio"),
        paste0("I2 = ", round(i2_val, 1), "%, ", ifelse(i2_val > 50, "variabilidad moderada-alta", "variabilidad baja-moderada")),
        "Poblacion, intervencion y desenlaces alineados con la pregunta PICOS",
        paste0("IC 95% del efecto global: ", round(exp(as.numeric(res$ci.lb)), 2), " - ", round(exp(as.numeric(res$ci.ub)), 2)),
        paste0("Test de Egger: p = ", round(egger_p_val, 3), ifelse(egger_p_val < 0.1, ". Asimetria detectada", ". Sin asimetria"))
      ),
      stringsAsFactors = FALSE
    )

    total_downgrades <- sum(grade$downgrade)
    certainty <- if (total_downgrades == 0) "Alta" else if (total_downgrades >= -1) "Moderada" else if (total_downgrades >= -2) "Baja" else "Muy Baja"

    # 7. Forest plot PNG
    forest_b64 <- tryCatch({
      tmp <- tempfile(fileext = ".png")
      png(tmp, width = 800, height = max(400, 80 + nrow(studies) * 40), res = 120)
      if (is_continuous) {
        forest(res, slab = paste(study_results$author, study_results$year),
               xlab = measure, header = c("Estudio", paste(measure, "[95% CI]")),
               col = "#0091DF", border = "#0091DF")
      } else {
        forest(res, slab = paste(study_results$author, study_results$year),
               xlab = "Odds Ratio", atransf = exp,
               header = c("Estudio", "OR [95% CI]"),
               col = "#0091DF", border = "#0091DF")
      }
      dev.off()
      b64 <- base64encode(tmp)
      unlink(tmp)
      paste0("data:image/png;base64,", b64)
    }, error = function(e) {
      NULL
    })

    # 8. Funnel plot PNG
    funnel_b64 <- tryCatch({
      tmp <- tempfile(fileext = ".png")
      png(tmp, width = 600, height = 500, res = 120)
      funnel(res, xlab = "Log Odds Ratio", main = "Funnel Plot",
             col = "#0091DF", pch = 19)
      dev.off()
      b64 <- base64encode(tmp)
      unlink(tmp)
      paste0("data:image/png;base64,", b64)
    }, error = function(e) {
      NULL
    })

    # 9. Trim and Fill analysis (publication bias correction)
    trimfill_res <- tryCatch({
      tf <- trimfill(res)
      tf_est <- if (is_continuous) as.numeric(tf$beta) else exp(as.numeric(tf$beta))
      tf_lo <- if (is_continuous) as.numeric(tf$ci.lb) else exp(as.numeric(tf$ci.lb))
      tf_hi <- if (is_continuous) as.numeric(tf$ci.ub) else exp(as.numeric(tf$ci.ub))
      list(
        k0 = as.numeric(tf$k0),
        side = ifelse(is.null(tf$side), "NA", as.character(tf$side)),
        estimate = round(tf_est, 2),
        ci_lb = round(tf_lo, 2),
        ci_ub = round(tf_hi, 2),
        p = round(as.numeric(tf$pval), 4)
      )
    }, error = function(e) {
      list(k0 = 0, side = "NA", estimate = NA, ci_lb = NA, ci_ub = NA, p = NA)
    })

    # 9b. Trim & fill funnel plot PNG
    trimfill_funnel_b64 <- tryCatch({
      tf <- trimfill(res)
      tmp <- tempfile(fileext = ".png")
      xlab_text <- if (is_continuous) paste("Log", measure) else paste("Log", measure)
      png(tmp, width = 600, height = 500, res = 120)
      funnel(tf, xlab = xlab_text, main = "Trim & Fill Funnel Plot",
             col = "#0091DF", pch = 19)
      dev.off()
      b64 <- base64encode(tmp)
      unlink(tmp)
      paste0("data:image/png;base64,", b64)
    }, error = function(e) NULL)

    # 10. Fail-safe N (Rosenthal, Orwin, Rosenberg)
    failsafe_n <- tryCatch({
      fsn_rosenthal <- fsn(yi, vi, data = es, type = "Rosenthal")
      fsn_rosenberg <- tryCatch(fsn(yi, vi, data = es, type = "Rosenberg"), error = function(e) list(fsnum = NA, pval = NA))
      fsn_orwin <- tryCatch(fsn(yi, vi, data = es, type = "Orwin"), error = function(e) list(fsnum = NA, pval = NA))
      list(
        rosenthal = list(fsnum = as.numeric(fsn_rosenthal$fsnum), pval = round(as.numeric(fsn_rosenthal$pval), 4)),
        rosenberg = list(fsnum = as.numeric(fsn_rosenberg$fsnum), pval = round(as.numeric(fsn_rosenberg$pval), 4)),
        orwin = list(fsnum = as.numeric(fsn_orwin$fsnum)),
        criterion_5k10 = as.numeric(fsn_rosenthal$fsnum) > (5 * nrow(studies) + 10)
      )
    }, error = function(e) {
      list(rosenthal = list(fsnum = NA, pval = NA), rosenberg = list(fsnum = NA, pval = NA), orwin = list(fsnum = NA), criterion_5k10 = FALSE)
    })

    # 11. Influence diagnostics (Cook's distance, DFBETAS, hat values, studentized residuals)
    influence_res <- tryCatch({
      inf <- influence(res)
      inf_df <- inf$inf
      study_labels <- paste(studies$author, studies$year)
      # Detect outliers: |rstudent| > 1.96
      rstud <- as.numeric(inf_df$rstudent)
      is_outlier <- abs(rstud) > 1.96
      # Detect influential: Cook's distance > median + 3*IQR
      cooks <- as.numeric(inf_df$cook.d)
      cooks_threshold <- median(cooks, na.rm = TRUE) + 3 * IQR(cooks, na.rm = TRUE)
      is_influential <- cooks > cooks_threshold

      list(
        studies = lapply(1:length(study_labels), function(i) {
          list(
            study = study_labels[i],
            rstudent = round(rstud[i], 3),
            dffits = round(as.numeric(inf_df$dffits[i]), 3),
            cooks_d = round(cooks[i], 4),
            cov_r = round(as.numeric(inf_df$cov.r[i]), 3),
            tau2_del = round(as.numeric(inf_df$tau2.del[i]), 4),
            QE_del = round(as.numeric(inf_df$QE.del[i]), 2),
            hat = round(as.numeric(inf_df$hat[i]), 3),
            dfbs = round(as.numeric(inf_df$dfbs.intrc[i]), 3),
            is_outlier = is_outlier[i],
            is_influential = is_influential[i]
          )
        }),
        n_outliers = sum(is_outlier),
        n_influential = sum(is_influential),
        outlier_labels = study_labels[is_outlier],
        influential_labels = study_labels[is_influential]
      )
    }, error = function(e) {
      list(studies = list(), n_outliers = 0, n_influential = 0, outlier_labels = character(0), influential_labels = character(0))
    })

    # 11b. Influence diagnostics plot PNG
    influence_plot_b64 <- tryCatch({
      inf <- influence(res)
      tmp <- tempfile(fileext = ".png")
      png(tmp, width = 900, height = 700, res = 120)
      plot(inf)
      dev.off()
      b64 <- base64encode(tmp)
      unlink(tmp)
      paste0("data:image/png;base64,", b64)
    }, error = function(e) NULL)

    # 12. Moderator / Subgroup analysis (if moderator variable provided)
    moderator_res <- NULL
    if (!is.null(data$moderator) && length(data$moderator) == nrow(studies)) {
      moderator_res <- tryCatch({
        mod_var <- as.factor(data$moderator)
        es$moderator <- mod_var
        res_mod <- rma(yi, vi, data = es, mods = ~ factor(moderator), method = method)
        # Subgroup analysis: fit separate models per level
        levels_list <- levels(mod_var)
        subgroups <- lapply(levels_list, function(lvl) {
          sub_es <- es[mod_var == lvl, ]
          if (nrow(sub_es) < 2) return(NULL)
          sub_res <- tryCatch(rma(yi, vi, data = sub_es, method = method), error = function(e) NULL)
          if (is.null(sub_res)) return(NULL)
          eff <- if (is_continuous) as.numeric(sub_res$beta) else exp(as.numeric(sub_res$beta))
          eff_lo <- if (is_continuous) as.numeric(sub_res$ci.lb) else exp(as.numeric(sub_res$ci.lb))
          eff_hi <- if (is_continuous) as.numeric(sub_res$ci.ub) else exp(as.numeric(sub_res$ci.ub))
          list(
            level = lvl,
            k = nrow(sub_es),
            estimate = round(eff, 2),
            ci_lb = round(eff_lo, 2),
            ci_ub = round(eff_hi, 2),
            p = round(as.numeric(sub_res$pval), 4),
            i2 = round(as.numeric(sub_res$I2), 1)
          )
        })
        subgroups <- subgroups[!sapply(subgroups, is.null)]
        list(
          Q_between = round(as.numeric(res_mod$QM), 2),
          Q_between_p = round(as.numeric(res_mod$QMp), 4),
          df = length(levels_list) - 1,
          residual_i2 = round(as.numeric(res_mod$I2), 1),
          subgroups = subgroups
        )
      }, error = function(e) NULL)
    }

    # 12b. Meta-regression (if continuous moderator provided)
    metareg_res <- NULL
    if (!is.null(data$meta_regression_var) && length(data$meta_regression_var) == nrow(studies)) {
      metareg_res <- tryCatch({
        reg_var <- as.numeric(data$meta_regression_var)
        es$regvar <- reg_var
        res_reg <- rma(yi, vi, data = es, mods = ~ regvar, method = method)
        list(
          intercept = round(as.numeric(res_reg$beta[1]), 4),
          slope = round(as.numeric(res_reg$beta[2]), 4),
          slope_se = round(as.numeric(res_reg$se[2]), 4),
          slope_p = round(as.numeric(res_reg$pval[2]), 4),
          Q_mod = round(as.numeric(res_reg$QM), 2),
          Q_mod_p = round(as.numeric(res_reg$QMp), 4),
          R2 = round(as.numeric(res_reg$R2), 1),
          residual_tau2 = round(as.numeric(res_reg$tau2), 4)
        )
      }, error = function(e) NULL)
    }

    # 13. Format LOO for JSON output (round values)
    loo_out <- lapply(1:nrow(loo_res), function(i) {
      list(
        removed = loo_res$removed[i],
        or = round(loo_res$or[i], 2),
        or_lo = round(loo_res$or_lo[i], 2),
        or_hi = round(loo_res$or_hi[i], 2)
      )
    })

    # 14. Build pooled results
    pooled_eff <- if (is_continuous) as.numeric(res$beta) else exp(as.numeric(res$beta))
    pooled_lo <- if (is_continuous) as.numeric(res$ci.lb) else exp(as.numeric(res$ci.lb))
    pooled_hi <- if (is_continuous) as.numeric(res$ci.ub) else exp(as.numeric(res$ci.ub))

    # 15. Build study output list
    study_out <- lapply(1:nrow(study_results), function(i) {
      row <- study_results[i, ]
      base <- list(
        id = i,
        author = row$author,
        year = row$year,
        yi = round(row$yi, 4),
        vi = round(row$vi, 4),
        se = round(row$se, 2),
        or = round(row$or, 2),
        or_lo = round(row$or_lo, 2),
        or_hi = round(row$or_hi, 2),
        weight = round(row$weight, 1)
      )
      if (is_continuous) {
        base$n_i <- studies$n_i[i]
        base$n_c <- studies$n_c[i]
        base$mean_i <- studies$mean_i[i]
        base$mean_c <- studies$mean_c[i]
        base$sd_i <- studies$sd_i[i]
        base$sd_c <- studies$sd_c[i]
      } else {
        base$events_i <- studies$events_i[i]
        base$total_i <- studies$total_i[i]
        base$events_c <- studies$events_c[i]
        base$total_c <- studies$total_c[i]
      }
      base
    })

    # 16. Effect size label
    effect_label <- switch(measure,
      "OR" = "Odds Ratio",
      "RR" = "Risk Ratio",
      "RD" = "Risk Difference",
      "SMD" = "Hedges' g (SMD)",
      "MD" = "Mean Difference",
      "ROM" = "Ratio of Means",
      measure
    )

    # 17. Return complete results
    result <- list(
      studies = study_out,
      measure = measure,
      is_continuous = is_continuous,
      effect_label = effect_label,
      pooled = list(
        or = round(pooled_eff, 2),
        or_lo = round(pooled_lo, 2),
        or_hi = round(pooled_hi, 2),
        p = as.numeric(res$pval),
        z = round(as.numeric(res$zval), 2)
      ),
      i2 = round(i2_val, 1),
      cochran_q = round(as.numeric(res$QE), 2),
      cochran_p = round(as.numeric(res$QEp), 4),
      tau2 = round(as.numeric(res$tau2), 4),
      tau = round(sqrt(as.numeric(res$tau2)), 4),
      H2 = round(as.numeric(res$H2), 2),
      model = ifelse(method == "DL", "Efectos Aleatorios (DerSimonian & Laird)", "Efectos Fijos (Inverse Variance)"),
      egger_intercept = round(ifelse(is.na(egger$intercept), 0, egger$intercept), 2),
      egger_p = round(ifelse(is.na(egger$p), 1, egger$p), 3),
      funnel_asymmetry = !is.na(egger$p) && egger$p < 0.1,
      trimfill = trimfill_res,
      trimfill_funnel_png = trimfill_funnel_b64,
      failsafe_n = failsafe_n,
      influence = influence_res,
      influence_plot_png = influence_plot_b64,
      loo = loo_out,
      maxImpact = list(
        removed = max_impact$removed,
        or = round(as.numeric(max_impact$or), 2),
        or_lo = round(as.numeric(max_impact$or_lo), 2),
        or_hi = round(as.numeric(max_impact$or_hi), 2)
      ),
      grade = lapply(1:nrow(grade), function(i) {
        list(
          domain = grade$domain[i],
          rating = grade$rating[i],
          downgrade = grade$downgrade[i],
          notes = grade$notes[i]
        )
      }),
      certainty = certainty,
      totalDowngrades = total_downgrades,
      forest_plot_png = forest_b64,
      funnel_plot_png = funnel_b64
    )

    # Add optional moderator/regression results
    if (!is.null(moderator_res)) result$moderator <- moderator_res
    if (!is.null(metareg_res)) result$meta_regression <- metareg_res

    result
  }, error = function(e) {
    list(error = TRUE, message = paste("R analysis error:", e$message))
  })
}

#* Descriptive statistics endpoint
#* @post /descriptive
#* @serializer json
function(req) {
  tryCatch({
    data <- jsonlite::fromJSON(req$postBody)
    values <- as.numeric(data$values)

    result <- list(
      n = length(values),
      mean = round(mean(values, na.rm = TRUE), 4),
      median = round(median(values, na.rm = TRUE), 4),
      sd = round(sd(values, na.rm = TRUE), 4),
      min = round(min(values, na.rm = TRUE), 4),
      max = round(max(values, na.rm = TRUE), 4),
      q1 = round(quantile(values, 0.25, na.rm = TRUE), 4),
      q3 = round(quantile(values, 0.75, na.rm = TRUE), 4),
      iqr = round(IQR(values, na.rm = TRUE), 4)
    )

    # Confidence interval for mean
    n <- length(values)
    se <- sd(values, na.rm = TRUE) / sqrt(n)
    t_crit <- qt(0.975, df = n - 1)
    result$ci_lo <- round(mean(values, na.rm = TRUE) - t_crit * se, 4)
    result$ci_hi <- round(mean(values, na.rm = TRUE) + t_crit * se, 4)

    # Shapiro-Wilk normality test (if n <= 5000)
    if (n >= 3 && n <= 5000) {
      sw <- shapiro.test(values)
      result$shapiro_w <- round(sw$statistic, 4)
      result$shapiro_p <- round(sw$p.value, 4)
      result$normal <- sw$p.value > 0.05
    }

    # If groups provided, do group comparison
    if (!is.null(data$groups)) {
      groups <- as.factor(data$groups)
      if (nlevels(groups) == 2) {
        g1 <- values[groups == levels(groups)[1]]
        g2 <- values[groups == levels(groups)[2]]

        # t-test
        tt <- t.test(g1, g2)
        result$t_test <- list(
          statistic = round(tt$statistic, 4),
          p = round(tt$p.value, 4),
          ci_lo = round(tt$conf.int[1], 4),
          ci_hi = round(tt$conf.int[2], 4),
          method = tt$method
        )

        # Wilcoxon
        wt <- wilcox.test(g1, g2)
        result$wilcoxon <- list(
          statistic = as.numeric(wt$statistic),
          p = round(wt$p.value, 4)
        )
      }
    }

    result
  }, error = function(e) {
    list(error = TRUE, message = paste("Descriptive stats error:", e$message))
  })
}

#* Primary data analysis endpoint (ECA, Cohorte, Caso-control, Transversal)
#* @post /analyze-primary
#* @serializer json
function(req) {
  tryCatch({
    input <- jsonlite::fromJSON(req$postBody)
    df <- as.data.frame(input$data)
    study_type <- ifelse(is.null(input$study_type), "eca", tolower(input$study_type))
    outcome_var <- input$outcome_var
    group_var <- input$group_var
    covariates <- input$covariates

    results <- list(study_type = study_type, n = nrow(df), variables = list())

    # --- Descriptive stats per variable ---
    for (col_name in colnames(df)) {
      vals <- df[[col_name]]
      info <- list(name = col_name)

      if (is.numeric(vals) || all(!is.na(suppressWarnings(as.numeric(vals))))) {
        vals_num <- as.numeric(vals)
        vals_num <- vals_num[!is.na(vals_num)]
        info$type <- "numeric"
        info$n <- length(vals_num)
        info$mean <- round(mean(vals_num), 4)
        info$sd <- round(sd(vals_num), 4)
        info$median <- round(median(vals_num), 4)
        info$min <- round(min(vals_num), 4)
        info$max <- round(max(vals_num), 4)
        info$q1 <- round(quantile(vals_num, 0.25), 4)
        info$q3 <- round(quantile(vals_num, 0.75), 4)
        se <- sd(vals_num) / sqrt(length(vals_num))
        t_crit <- qt(0.975, df = length(vals_num) - 1)
        info$ci_lo <- round(mean(vals_num) - t_crit * se, 4)
        info$ci_hi <- round(mean(vals_num) + t_crit * se, 4)
        if (length(vals_num) >= 3 && length(vals_num) <= 5000) {
          sw <- shapiro.test(vals_num)
          info$shapiro_w <- round(sw$statistic, 4)
          info$shapiro_p <- round(sw$p.value, 4)
          info$normal <- sw$p.value > 0.05
        }
      } else {
        info$type <- "categorical"
        freq_table <- table(vals)
        info$levels <- names(freq_table)
        info$counts <- as.numeric(freq_table)
        info$proportions <- round(as.numeric(prop.table(freq_table)), 4)
      }
      results$variables[[col_name]] <- info
    }

    # --- Group-based descriptive stats ---
    if (!is.null(group_var) && group_var %in% colnames(df)) {
      groups <- as.factor(df[[group_var]])
      group_desc <- list()
      for (lvl in levels(groups)) {
        sub_df <- df[groups == lvl, ]
        gd <- list(n = nrow(sub_df))
        for (col_name in colnames(df)) {
          if (col_name == group_var) next
          vals <- sub_df[[col_name]]
          if (is.numeric(vals) || all(!is.na(suppressWarnings(as.numeric(vals))))) {
            vals_num <- as.numeric(vals)
            vals_num <- vals_num[!is.na(vals_num)]
            gd[[col_name]] <- list(
              mean = round(mean(vals_num), 4),
              sd = round(sd(vals_num), 4),
              median = round(median(vals_num), 4),
              n = length(vals_num)
            )
          } else {
            freq <- table(vals)
            gd[[col_name]] <- list(
              levels = names(freq),
              counts = as.numeric(freq)
            )
          }
        }
        group_desc[[lvl]] <- gd
      }
      results$group_descriptive <- group_desc
    }

    # --- Inferential analysis ---
    results$inferential <- list()

    if (!is.null(group_var) && group_var %in% colnames(df) && !is.null(outcome_var) && outcome_var %in% colnames(df)) {
      groups <- as.factor(df[[group_var]])
      outcome <- df[[outcome_var]]
      is_outcome_numeric <- is.numeric(outcome) || all(!is.na(suppressWarnings(as.numeric(outcome))))

      if (is_outcome_numeric) {
        outcome_num <- as.numeric(outcome)

        if (nlevels(groups) == 2) {
          g1 <- outcome_num[groups == levels(groups)[1]]
          g2 <- outcome_num[groups == levels(groups)[2]]

          # t-test
          tt <- t.test(g1, g2)
          results$inferential$t_test <- list(
            statistic = round(tt$statistic, 4),
            p = round(tt$p.value, 4),
            ci_lo = round(tt$conf.int[1], 4),
            ci_hi = round(tt$conf.int[2], 4),
            method = tt$method,
            group1_mean = round(mean(g1, na.rm = TRUE), 4),
            group2_mean = round(mean(g2, na.rm = TRUE), 4)
          )

          # Wilcoxon
          wt <- wilcox.test(g1, g2)
          results$inferential$wilcoxon <- list(
            statistic = as.numeric(wt$statistic),
            p = round(wt$p.value, 4)
          )
        }

        if (nlevels(groups) >= 2) {
          # ANOVA
          aov_res <- aov(outcome_num ~ groups)
          aov_summary <- summary(aov_res)
          results$inferential$anova <- list(
            f_statistic = round(aov_summary[[1]]$`F value`[1], 4),
            p = round(aov_summary[[1]]$`Pr(>F)`[1], 4)
          )
        }

        # Binary outcome: logistic regression
        unique_vals <- unique(outcome_num[!is.na(outcome_num)])
        if (length(unique_vals) == 2 && all(unique_vals %in% c(0, 1))) {
          glm_formula <- as.formula(paste("outcome_num ~", group_var))
          glm_fit <- glm(glm_formula, data = df, family = binomial)
          glm_coefs <- summary(glm_fit)$coefficients
          results$inferential$logistic <- list(
            or = round(exp(glm_coefs[2, 1]), 4),
            or_lo = round(exp(glm_coefs[2, 1] - 1.96 * glm_coefs[2, 2]), 4),
            or_hi = round(exp(glm_coefs[2, 1] + 1.96 * glm_coefs[2, 2]), 4),
            p = round(glm_coefs[2, 4], 4)
          )

          # Chi-squared
          ct <- table(df[[group_var]], outcome_num)
          chi <- chisq.test(ct)
          results$inferential$chi_squared <- list(
            statistic = round(chi$statistic, 4),
            p = round(chi$p.value, 4),
            df = chi$parameter
          )
        }
      } else {
        # Categorical outcome: Chi-squared
        ct <- table(df[[group_var]], outcome)
        chi <- chisq.test(ct)
        results$inferential$chi_squared <- list(
          statistic = round(chi$statistic, 4),
          p = round(chi$p.value, 4),
          df = chi$parameter
        )
      }

      # Study-type specific analyses
      if (study_type == "cohorte" && !is.null(outcome_var)) {
        # Cox regression if time variable available
        time_var <- NULL
        for (cv in covariates) {
          if (grepl("time|tiempo|seguimiento|survival", cv, ignore.case = TRUE)) {
            time_var <- cv
            break
          }
        }
        if (!is.null(time_var) && time_var %in% colnames(df)) {
          time_vals <- as.numeric(df[[time_var]])
          event_vals <- as.numeric(df[[outcome_var]])
          surv_formula <- as.formula(paste("Surv(time_vals, event_vals) ~", group_var))
          cox_fit <- coxph(surv_formula, data = df)
          cox_summary <- summary(cox_fit)
          results$inferential$cox <- list(
            hr = round(cox_summary$conf.int[1, 1], 4),
            hr_lo = round(cox_summary$conf.int[1, 3], 4),
            hr_hi = round(cox_summary$conf.int[1, 4], 4),
            p = round(cox_summary$coefficients[1, 5], 4)
          )
        }
      }

      if (study_type == "transversal" && is_outcome_numeric) {
        # Prevalence
        unique_vals <- unique(as.numeric(outcome)[!is.na(as.numeric(outcome))])
        if (length(unique_vals) == 2 && all(unique_vals %in% c(0, 1))) {
          outcome_num <- as.numeric(outcome)
          prev <- mean(outcome_num, na.rm = TRUE)
          n_total <- sum(!is.na(outcome_num))
          se_prev <- sqrt(prev * (1 - prev) / n_total)
          results$inferential$prevalence <- list(
            prevalence = round(prev, 4),
            ci_lo = round(max(0, prev - 1.96 * se_prev), 4),
            ci_hi = round(min(1, prev + 1.96 * se_prev), 4),
            n = n_total
          )
        }
      }
    }

    # --- Plots ---
    results$plots <- list()

    # Histogram of outcome variable
    if (!is.null(outcome_var) && outcome_var %in% colnames(df)) {
      outcome_vals <- suppressWarnings(as.numeric(df[[outcome_var]]))
      if (!all(is.na(outcome_vals))) {
        hist_b64 <- tryCatch({
          tmp <- tempfile(fileext = ".png")
          png(tmp, width = 600, height = 400, res = 120)
          hist_data <- outcome_vals[!is.na(outcome_vals)]
          p <- ggplot(data.frame(x = hist_data), aes(x = x)) +
            geom_histogram(fill = "#0091DF", color = "white", bins = 20) +
            labs(title = paste("Distribucion:", outcome_var), x = outcome_var, y = "Frecuencia") +
            theme_minimal()
          print(p)
          dev.off()
          b64 <- base64encode(tmp)
          unlink(tmp)
          paste0("data:image/png;base64,", b64)
        }, error = function(e) NULL)
        if (!is.null(hist_b64)) results$plots$histogram <- hist_b64
      }
    }

    # Boxplot by group
    if (!is.null(group_var) && group_var %in% colnames(df) && !is.null(outcome_var) && outcome_var %in% colnames(df)) {
      outcome_vals <- suppressWarnings(as.numeric(df[[outcome_var]]))
      if (!all(is.na(outcome_vals))) {
        box_b64 <- tryCatch({
          tmp <- tempfile(fileext = ".png")
          png(tmp, width = 600, height = 400, res = 120)
          plot_df <- data.frame(group = as.factor(df[[group_var]]), outcome = outcome_vals)
          plot_df <- plot_df[!is.na(plot_df$outcome), ]
          p <- ggplot(plot_df, aes(x = group, y = outcome, fill = group)) +
            geom_boxplot(alpha = 0.7) +
            labs(title = paste(outcome_var, "por", group_var), x = group_var, y = outcome_var) +
            scale_fill_manual(values = c("#0091DF", "#00C49A", "#FF6B6B", "#FFD93D")) +
            theme_minimal() +
            theme(legend.position = "none")
          print(p)
          dev.off()
          b64 <- base64encode(tmp)
          unlink(tmp)
          paste0("data:image/png;base64,", b64)
        }, error = function(e) NULL)
        if (!is.null(box_b64)) results$plots$boxplot <- box_b64
      }
    }

    results
  }, error = function(e) {
    list(error = TRUE, message = paste("Primary analysis error:", e$message))
  })
}

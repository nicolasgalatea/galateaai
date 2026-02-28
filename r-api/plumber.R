library(plumber)
library(metafor)
library(ggplot2)
library(base64enc)
library(jsonlite)

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

    # 1. Calculate effect sizes (dichotomous data)
    es <- escalc(
      measure = measure,
      ai = studies$events_i,
      bi = studies$total_i - studies$events_i,
      ci = studies$events_c,
      di = studies$total_c - studies$events_c
    )

    # 2. Random-effects meta-analysis
    res <- rma(yi, vi, data = es, method = method)

    # 3. Build per-study results
    study_results <- data.frame(
      author = studies$author,
      year = studies$year,
      yi = as.numeric(es$yi),
      vi = as.numeric(es$vi),
      se = sqrt(as.numeric(es$vi)),
      or = exp(as.numeric(es$yi)),
      or_lo = exp(as.numeric(es$yi) - 1.96 * sqrt(as.numeric(es$vi))),
      or_hi = exp(as.numeric(es$yi) + 1.96 * sqrt(as.numeric(es$vi))),
      weight = as.numeric(weights(res)),
      stringsAsFactors = FALSE
    )

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
      forest(res, slab = paste(study_results$author, study_results$year),
             xlab = "Odds Ratio", atransf = exp,
             header = c("Estudio", "OR [95% CI]"),
             col = "#0091DF", border = "#0091DF")
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

    # 9. Format LOO for JSON output (round values)
    loo_out <- lapply(1:nrow(loo_res), function(i) {
      list(
        removed = loo_res$removed[i],
        or = round(loo_res$or[i], 2),
        or_lo = round(loo_res$or_lo[i], 2),
        or_hi = round(loo_res$or_hi[i], 2)
      )
    })

    # 10. Return complete results
    list(
      studies = lapply(1:nrow(study_results), function(i) {
        row <- study_results[i, ]
        list(
          id = i,
          author = row$author,
          year = row$year,
          events_i = studies$events_i[i],
          total_i = studies$total_i[i],
          events_c = studies$events_c[i],
          total_c = studies$total_c[i],
          yi = round(row$yi, 4),
          vi = round(row$vi, 4),
          se = round(row$se, 2),
          or = round(row$or, 2),
          or_lo = round(row$or_lo, 2),
          or_hi = round(row$or_hi, 2),
          weight = round(row$weight, 1)
        )
      }),
      pooled = list(
        or = round(exp(as.numeric(res$beta)), 2),
        or_lo = round(exp(as.numeric(res$ci.lb)), 2),
        or_hi = round(exp(as.numeric(res$ci.ub)), 2),
        p = as.numeric(res$pval),
        z = round(as.numeric(res$zval), 2)
      ),
      i2 = round(i2_val, 1),
      cochran_q = round(as.numeric(res$QE), 2),
      cochran_p = round(as.numeric(res$QEp), 4),
      tau2 = round(as.numeric(res$tau2), 4),
      model = ifelse(method == "DL", "Efectos Aleatorios (DerSimonian & Laird)", "Efectos Fijos (Inverse Variance)"),
      egger_intercept = round(ifelse(is.na(egger$intercept), 0, egger$intercept), 2),
      egger_p = round(ifelse(is.na(egger$p), 1, egger$p), 3),
      funnel_asymmetry = !is.na(egger$p) && egger$p < 0.1,
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

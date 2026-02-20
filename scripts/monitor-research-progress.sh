#!/usr/bin/env bash
# =============================================================================
# monitor-research-progress.sh
# Monitorea research_projects, valida outputs y loguea errores.
#
# Uso:
#   export VITE_SUPABASE_URL=...
#   export VITE_SUPABASE_ANON_KEY=...
#   bash scripts/monitor-research-progress.sh <project_id> [duracion_min]
#
# Ejemplo:
#   bash scripts/monitor-research-progress.sh e8233417-9ddf-4453-8372-c5b6797da8aa 15
# =============================================================================

set -euo pipefail

PID="${1:?Uso: $0 <project_id> [duracion_min]}"
DURATION_MIN="${2:-10}"
POLL_INTERVAL=5

# --- Cargar .env si las variables no estan definidas ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
if [ -z "${VITE_SUPABASE_ANON_KEY:-}" ] && [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep VITE_SUPABASE "$PROJECT_ROOT/.env" | xargs)
fi

SUPA_URL="${VITE_SUPABASE_URL:?Falta VITE_SUPABASE_URL}"
SUPA_KEY="${VITE_SUPABASE_ANON_KEY:?Falta VITE_SUPABASE_ANON_KEY}"
API="${SUPA_URL}/rest/v1"
AUTH=(-H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}")

# --- Columnas semanticas y sus campos obligatorios ---
VALIDATOR_JS=$(cat <<'JSEOF'
const input = JSON.parse(require("fs").readFileSync("/dev/stdin","utf8"));
const row = input[0];
if (!row) { console.log("ERROR: Fila no encontrada"); process.exit(1); }

// Reglas de validacion por columna semantica
const RULES = {
  research_question: {
    label: "Arquitecto (Fases 0-3)",
    required: ["pregunta_estructurada"],
    recommended: ["idea_general", "tipo_estudio", "pico_data", "modelo_pregunta"]
  },
  finer_results: {
    label: "Metodologo (Fases 4-6)",
    required: ["aprobado", "finer_scores"],
    recommended: ["recomendaciones", "hipotesis"]
  },
  search_strategy: {
    label: "Evidencia (Fase 7)",
    required: ["ecuacion_booleana"],
    recommended: ["descriptores", "bases_datos", "mesh_terms"]
  },
  protocol_draft: {
    label: "Redactor — Protocolo (Fases 8-10)",
    required: ["indice_protocolo"],
    recommended: ["guia_equator", "checklist_items", "url_guia"]
  },
  manuscript_draft: {
    label: "Redactor — Manuscrito (Fases 8-10)",
    required: [],
    recommended: ["guia_introduccion", "guia_metodos"]
  },
  statistical_plan: {
    label: "Redactor — Plan Estadistico (Fases 8-10)",
    required: [],
    recommended: ["pruebas_estadisticas", "checklist_etica"]
  }
};

const SEMANTIC_COLS = [
  "research_question", "finer_results", "search_strategy",
  "protocol_draft", "manuscript_draft", "statistical_plan"
];

const result = {
  project_id: row.id,
  current_phase: row.current_phase,
  status: row.status,
  updated_at: row.updated_at,
  phases: {},
  errors: [],
  warnings: []
};

for (const col of SEMANTIC_COLS) {
  const data = row[col];
  const rule = RULES[col];

  if (data === null || data === undefined) {
    result.phases[col] = { status: "empty" };
    continue;
  }

  // Parsear si es string
  let obj;
  try {
    obj = typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    result.phases[col] = { status: "INVALID_JSON", error: e.message };
    result.errors.push({ phase: col, type: "INVALID_JSON", message: e.message });
    continue;
  }

  const keys = Object.keys(obj);
  const size = JSON.stringify(obj).length;

  // Check requeridos
  const missing = [];
  for (const req of rule.required) {
    const found = obj[req] !== undefined && obj[req] !== null
      || (obj.pico_data && obj.pico_data[req] !== undefined);
    if (!found) missing.push(req);
  }

  // Check recomendados
  const missingRec = [];
  for (const rec of rule.recommended) {
    const found = obj[rec] !== undefined && obj[rec] !== null
      || (obj.pico_data && obj.pico_data[rec] !== undefined);
    if (!found) missingRec.push(rec);
  }

  const phaseStatus = missing.length > 0 ? "INCOMPLETE" : "VALID";

  result.phases[col] = {
    status: phaseStatus,
    keys: keys.length,
    size_bytes: size,
    missing_required: missing.length > 0 ? missing : undefined,
    missing_recommended: missingRec.length > 0 ? missingRec : undefined
  };

  if (missing.length > 0) {
    result.errors.push({
      phase: col,
      type: "MISSING_REQUIRED",
      fields: missing,
      message: `${rule.label}: faltan campos obligatorios [${missing.join(", ")}]`
    });
  }
  if (missingRec.length > 0) {
    result.warnings.push({
      phase: col,
      type: "MISSING_RECOMMENDED",
      fields: missingRec
    });
  }
}

console.log(JSON.stringify(result, null, 2));
JSEOF
)

# --- Funcion: inyectar error en agent_executions ---
inject_error() {
  local phase_col="$1"
  local error_msg="$2"
  local agent_num

  case "$phase_col" in
    research_question)  agent_num=1 ;;
    finer_results)      agent_num=2 ;;
    search_strategy)    agent_num=3 ;;
    protocol_draft)     agent_num=4 ;;
    manuscript_draft)   agent_num=4 ;;
    statistical_plan)   agent_num=4 ;;
    *) agent_num=0 ;;
  esac

  curl -sf -X POST "${API}/agent_executions" \
    "${AUTH[@]}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{
      \"project_id\": \"${PID}\",
      \"agent_number\": ${agent_num},
      \"agent_name\": \"MONITOR_VALIDATOR\",
      \"status\": \"failed\",
      \"error_message\": $(echo "$error_msg" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.stringify(d.trim())))"),
      \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }" > /dev/null 2>&1 && echo "    -> Error inyectado en agent_executions (agent #${agent_num})" \
    || echo "    -> FALLO al inyectar error en agent_executions"
}

# =============================================================================
# LOOP PRINCIPAL
# =============================================================================

END=$((SECONDS + DURATION_MIN * 60))
PREV_HASH=""
POLL=0

echo "================================================================"
echo " MONITOR research_projects"
echo " Project:  ${PID}"
echo " Duracion: ${DURATION_MIN} min (poll cada ${POLL_INTERVAL}s)"
echo " Inicio:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================================================"
echo ""

while [ $SECONDS -lt $END ]; do
  POLL=$((POLL + 1))

  ROW=$(curl -sf "${API}/research_projects?id=eq.${PID}&select=*" \
    "${AUTH[@]}" 2>/dev/null || echo "[]")

  CUR_HASH=$(echo "$ROW" | md5sum | cut -d' ' -f1)

  if [ "$CUR_HASH" != "$PREV_HASH" ]; then
    echo ""
    echo "=== CAMBIO DETECTADO (poll #${POLL}, $(date -u +%H:%M:%SZ)) ==="

    # Ejecutar validacion
    VALIDATION=$(echo "$ROW" | node -e "$VALIDATOR_JS" 2>&1) || true
    echo "$VALIDATION"

    # Extraer errores y inyectar en agent_executions
    ERROR_COUNT=$(echo "$VALIDATION" | node -e "
      let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
        try { const v=JSON.parse(d); console.log(v.errors ? v.errors.length : 0) }
        catch(e) { console.log(0) }
      })" 2>/dev/null || echo "0")

    if [ "$ERROR_COUNT" -gt 0 ] 2>/dev/null; then
      echo ""
      echo "--- Inyectando ${ERROR_COUNT} error(es) en agent_executions ---"
      echo "$VALIDATION" | node -e "
        let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
          const v=JSON.parse(d);
          (v.errors||[]).forEach(e=>console.log(e.phase+'|||'+e.message))
        })" 2>/dev/null | while IFS='|||' read -r phase msg; do
          inject_error "$phase" "$msg"
        done
    fi

    PREV_HASH="$CUR_HASH"
  fi

  # Heartbeat cada 12 polls (~60s)
  if [ $((POLL % 12)) -eq 0 ]; then
    STATUS=$(echo "$ROW" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const r=JSON.parse(d)[0];console.log(r?r.status+' phase='+r.current_phase:'?')})" 2>/dev/null || echo "?")
    echo "[hb] #${POLL} $(date -u +%H:%M:%SZ) | ${STATUS}"
  fi

  sleep $POLL_INTERVAL
done

echo ""
echo "================================================================"
echo " MONITOREO FINALIZADO — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================================================"
echo ""
echo "Estado final:"
curl -sf "${API}/research_projects?id=eq.${PID}&select=*" \
  "${AUTH[@]}" | node -e "$VALIDATOR_JS" 2>/dev/null || echo "(sin datos)"

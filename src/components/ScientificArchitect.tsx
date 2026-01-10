import { useState } from 'react';
import { 
  Lightbulb, FileText, Target, BookOpen, Edit3, Check, ChevronDown, 
  AlertTriangle, Link2, Quote, Brain, Gauge, CheckCircle2, XCircle,
  Lock, Download, Stamp, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface ScientificFoundation {
  problemStatement: string;
  justification: string;
  conceptualFramework: string;
  sources: Array<{
    id: string;
    text: string;
    reference: string;
    sourceAgent: string;
  }>;
}

interface CoherenceCheck {
  objectivesAligned: boolean;
  searchStrategyAligned: boolean;
  methodologyConsistent: boolean;
  score: number;
  issues: string[];
}

interface ScientificArchitectProps {
  isVisible: boolean;
  onFoundationComplete: (foundation: ScientificFoundation) => void;
  ideaInput: string;
}

const DEFAULT_FOUNDATION: ScientificFoundation = {
  problemStatement: `**Vacío de conocimiento identificado:**

La metformina, fármaco de primera línea para el tratamiento de la diabetes mellitus tipo 2 (DM2), ha demostrado en estudios preclínicos propiedades que trascienden su efecto hipoglucemiante. Sin embargo, existe una brecha significativa en la comprensión de su potencial neuroprotector en poblaciones humanas geriátricas.

**Problema central:**
A pesar de más de dos décadas de investigación observacional, no existe un consenso definitivo sobre si el uso crónico de metformina modifica el riesgo de desarrollar enfermedad de Alzheimer (EA) en pacientes con DM2. Los estudios existentes presentan resultados contradictorios, con algunos reportando efectos protectores (OR: 0.4-0.7) y otros sin asociación significativa.

**Dimensiones no resueltas:**
1. Mecanismo exacto de neuroprotección (vía AMPK, reducción de neuroinflamación, o modulación de insulina cerebral)
2. Dosis óptima para efecto cognitivo vs. efecto metabólico
3. Ventana terapéutica ideal (¿prevención primaria o secundaria?)`,
  
  justification: `**Relevancia para la industria farmacéutica (Bayer Perspective):**

El mercado de terapias para Alzheimer supera los $10 billones USD anuales, con proyecciones de crecimiento del 15% hasta 2030. Identificar un reposicionamiento de fármaco existente (metformina) como agente neuroprotector representa una oportunidad estratégica de alto impacto con reducción significativa de tiempos y costos de desarrollo.

**Relevancia para la salud pública:**
- La DM2 afecta a 537 millones de adultos globalmente (IDF, 2024)
- Los pacientes con DM2 tienen 1.5-2x mayor riesgo de demencia
- Identificar intervenciones preventivas podría reducir la carga global de demencia en 20-30%

**Urgencia científica:**
La convergencia de epidemias (diabetes y demencia) en poblaciones envejecidas demanda evidencia de alta calidad que guíe la práctica clínica. Esta revisión sistemática proporcionará el nivel de evidencia requerido para informar guías de práctica clínica y ensayos clínicos fase III.`,
  
  conceptualFramework: `**Variables principales y su interrelación:**

┌─────────────────────────────────────────────────────────────────┐
│                    MARCO CONCEPTUAL                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [EXPOSICIÓN]          [MEDIADORES]           [DESENLACE]       │
│                                                                  │
│  Metformina    ─────►  • Activación AMPK  ─────►  Riesgo de EA  │
│  (Dosis/Tiempo)        • ↓ Inflamación          • Incidencia    │
│                        • ↓ Estrés oxidativo     • MMSE score    │
│                        • Modulación insulina    • Biomarcadores │
│                                                                  │
│  [CONFUSORES]                                                    │
│  • Edad, Sexo, Educación                                        │
│  • Control glucémico (HbA1c)                                    │
│  • Comorbilidades cardiovasculares                              │
│  • Uso de otros antidiabéticos                                  │
│                                                                  │
│  [MODIFICADORES DE EFECTO]                                       │
│  • Genotipo APOE                                                │
│  • Duración de DM2                                              │
│  • Función renal basal                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

**Hipótesis de trabajo:**
H₀: No existe asociación entre uso de metformina e incidencia de Alzheimer
H₁: El uso de metformina ≥2 años reduce el riesgo de Alzheimer en ≥20% (HR ≤ 0.80)`,
  
  sources: [
    {
      id: '1',
      text: 'La metformina activa AMPK cerebral, promoviendo autofagia y reduciendo acumulación de tau fosforilada.',
      reference: 'DiTacchio KA et al. J Alzheimers Dis. 2015;43(4):1225-37',
      sourceAgent: 'Literature Scout'
    },
    {
      id: '2',
      text: 'Estudios observacionales reportan OR entre 0.49-0.82 para desarrollo de demencia con uso de metformina.',
      reference: 'Ng TP et al. J Alzheimers Dis. 2014;37(4):749-58',
      sourceAgent: 'Literature Scout'
    },
    {
      id: '3',
      text: 'La heterogeneidad en definiciones de deterioro cognitivo limita la comparabilidad entre estudios.',
      reference: 'Campbell JM et al. Diabetes Obes Metab. 2017;19(6):829-837',
      sourceAgent: 'Literature Scout'
    },
    {
      id: '4',
      text: 'La vía de señalización de insulina cerebral está implicada en la patogénesis del Alzheimer.',
      reference: 'Arnold SE et al. Nat Rev Neurol. 2018;14(3):168-181',
      sourceAgent: 'Literature Scout'
    }
  ]
};

export function ScientificArchitect({ isVisible, onFoundationComplete, ideaInput }: ScientificArchitectProps) {
  const [foundation, setFoundation] = useState<ScientificFoundation>(DEFAULT_FOUNDATION);
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [coherenceCheck, setCoherenceCheck] = useState<CoherenceCheck | null>(null);

  const bayerBlue = '#0033A0';

  const handleEdit = (field: keyof ScientificFoundation, value: string) => {
    setFoundation(prev => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const runCoherenceCheck = () => {
    setIsProcessing(true);
    
    // Simulate coherence analysis
    setTimeout(() => {
      const check: CoherenceCheck = {
        objectivesAligned: true,
        searchStrategyAligned: true,
        methodologyConsistent: true,
        score: 94,
        issues: []
      };

      // Check if problem mentions Alzheimer
      if (!foundation.problemStatement.toLowerCase().includes('alzheimer')) {
        check.objectivesAligned = false;
        check.score -= 15;
        check.issues.push('El planteamiento no menciona explícitamente el desenlace principal (Alzheimer)');
      }

      // Check if justification mentions methodology
      if (!foundation.justification.toLowerCase().includes('revisión sistemática') && 
          !foundation.justification.toLowerCase().includes('systematic review')) {
        check.methodologyConsistent = false;
        check.score -= 10;
        check.issues.push('La justificación no conecta con el diseño metodológico propuesto');
      }

      // Check search strategy alignment
      if (!ideaInput.toLowerCase().includes('metformina') && 
          !ideaInput.toLowerCase().includes('metformin')) {
        check.searchStrategyAligned = false;
        check.score -= 20;
        check.issues.push('La estrategia de búsqueda no incluye la intervención principal');
      }

      setCoherenceCheck(check);
      setIsProcessing(false);
    }, 1500);
  };

  const handleLockFoundation = () => {
    runCoherenceCheck();
    setTimeout(() => {
      setIsLocked(true);
      onFoundationComplete(foundation);
    }, 2000);
  };

  const exportProtocolDocument = () => {
    const now = new Date();
    const docId = `GALATEA-PROTOCOL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const documentContent = [
      '╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗',
      '║                                                                                                          ║',
      '║                           GALATEA AI - PROTOCOLO DE INVESTIGACIÓN CIENTÍFICA                            ║',
      '║                               Scientific Research Protocol Document                                       ║',
      '║                                                                                                          ║',
      '╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝',
      '',
      `                                    ┌────────────────────────────────────┐`,
      `                                    │   📋 LISTO PARA COMITÉ / AUDITORÍA  │`,
      `                                    │   Ready for Committee / Audit       │`,
      `                                    └────────────────────────────────────┘`,
      '',
      `  📋 Document ID: ${docId}`,
      `  📅 Fecha de Generación: ${now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `  ⏰ Hora: ${now.toLocaleTimeString('es-ES')}`,
      `  🔒 Estado: PROTOCOLO CONSOLIDADO`,
      coherenceCheck ? `  📊 Score de Coherencia: ${coherenceCheck.score}%` : '',
      '',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '                                              ÍNDICE / INDEX',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '',
      '  1. Introducción y Fundamentación Científica',
      '     1.1 Planteamiento del Problema',
      '     1.2 Justificación',
      '     1.3 Marco Conceptual',
      '',
      '  2. Metodología',
      '     2.1 Pregunta de Investigación (PICOT)',
      '     2.2 Estrategia de Búsqueda',
      '     2.3 Criterios de Selección',
      '',
      '  3. Plan de Análisis',
      '',
      '  4. Consideraciones Éticas',
      '',
      '  5. Referencias Bibliográficas',
      '',
      '  6. Anexos',
      '',
      '',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '                            1. INTRODUCCIÓN Y FUNDAMENTACIÓN CIENTÍFICA',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '  1.1 PLANTEAMIENTO DEL PROBLEMA',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '',
      foundation.problemStatement,
      '',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '  1.2 JUSTIFICACIÓN',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '',
      foundation.justification,
      '',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '  1.3 MARCO CONCEPTUAL',
      '─────────────────────────────────────────────────────────────────────────────────────────────────────────────',
      '',
      foundation.conceptualFramework,
      '',
      '',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '                                    TRAZABILIDAD DE FUENTES',
      '═══════════════════════════════════════════════════════════════════════════════════════════════════════════',
      '',
      ...foundation.sources.map((s, idx) => [
        `  [${idx + 1}] ${s.text}`,
        `      📖 Referencia: ${s.reference}`,
        `      🤖 Fuente: Agente ${s.sourceAgent}`,
        ''
      ].join('\n')),
      '',
      '',
      '╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗',
      '║                                                                                                          ║',
      '║                                        SELLO DE CONSOLIDACIÓN                                            ║',
      '║                                                                                                          ║',
      '║     ┌────────────────────────────────────────────────────────────────────────────────────────────┐      ║',
      '║     │                                                                                            │      ║',
      '║     │                           ✅ PROTOCOLO CONSOLIDADO                                         │      ║',
      '║     │                                                                                            │      ║',
      '║     │           Este documento ha sido validado por Galatea AI y está listo para:               │      ║',
      '║     │           • Presentación ante Comité de Ética                                              │      ║',
      '║     │           • Registro en PROSPERO                                                           │      ║',
      '║     │           • Auditoría metodológica                                                         │      ║',
      '║     │                                                                                            │      ║',
      '║     └────────────────────────────────────────────────────────────────────────────────────────────┘      ║',
      '║                                                                                                          ║',
      '║     Galatea AI - Clinical Guideline Navigator                                                            ║',
      '║     Precision Medicine Intelligence                                                                      ║',
      '║                                                                                                          ║',
      '╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝',
    ].join('\n');

    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocolo-cientifico-${docId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Header - Agente 10: Problem Architect */}
      <div 
        className="bg-white rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}
      >
        <div 
          className="p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                Agente 10: Problem Architect
                <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">
                  Fundamentación Científica
                </span>
              </h3>
              <p className="text-sm text-amber-700">
                Construyendo la base conceptual de tu investigación
              </p>
            </div>
          </div>

          {isLocked ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Lock className="w-4 h-4" />
              <span className="font-semibold text-sm">Fundamentación Congelada</span>
            </div>
          ) : (
            <Button
              onClick={handleLockFoundation}
              disabled={isProcessing}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              style={{ borderRadius: '12px' }}
            >
              <Stamp className="w-4 h-4" />
              Congelar Fundamentación
            </Button>
          )}
        </div>

        {/* Expandable Sections */}
        <div className="p-6 bg-amber-50/30">
          <Accordion type="multiple" defaultValue={['problem', 'justification', 'framework']} className="space-y-4">
            {/* Planteamiento del Problema */}
            <AccordionItem value="problem" className="border border-amber-200 rounded-xl overflow-hidden bg-white">
              <AccordionTrigger className="px-4 py-3 hover:bg-amber-50/50 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">1.1 Planteamiento del Problema</h4>
                    <p className="text-xs text-muted-foreground">Análisis del vacío de conocimiento actual</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {isEditing.problemStatement && !isLocked ? (
                  <div className="space-y-2">
                    <Textarea
                      value={foundation.problemStatement}
                      onChange={(e) => handleEdit('problemStatement', e.target.value)}
                      className="min-h-[200px] font-serif text-sm leading-relaxed"
                    />
                    <Button size="sm" onClick={() => toggleEdit('problemStatement')} className="gap-1">
                      <Check className="w-3 h-3" /> Guardar
                    </Button>
                  </div>
                ) : (
                  <div className="relative group">
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-serif"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {foundation.problemStatement}
                    </div>
                    {!isLocked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEdit('problemStatement')}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-3 h-3 mr-1" /> Editar
                      </Button>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Justificación */}
            <AccordionItem value="justification" className="border border-amber-200 rounded-xl overflow-hidden bg-white">
              <AccordionTrigger className="px-4 py-3 hover:bg-amber-50/50 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">1.2 Justificación</h4>
                    <p className="text-xs text-muted-foreground">Relevancia para Bayer y salud pública</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {isEditing.justification && !isLocked ? (
                  <div className="space-y-2">
                    <Textarea
                      value={foundation.justification}
                      onChange={(e) => handleEdit('justification', e.target.value)}
                      className="min-h-[200px] font-serif text-sm leading-relaxed"
                    />
                    <Button size="sm" onClick={() => toggleEdit('justification')} className="gap-1">
                      <Check className="w-3 h-3" /> Guardar
                    </Button>
                  </div>
                ) : (
                  <div className="relative group">
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-serif"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {foundation.justification}
                    </div>
                    {!isLocked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEdit('justification')}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-3 h-3 mr-1" /> Editar
                      </Button>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Marco Conceptual */}
            <AccordionItem value="framework" className="border border-amber-200 rounded-xl overflow-hidden bg-white">
              <AccordionTrigger className="px-4 py-3 hover:bg-amber-50/50 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">1.3 Marco Conceptual</h4>
                    <p className="text-xs text-muted-foreground">Definición de variables y su interrelación</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {isEditing.conceptualFramework && !isLocked ? (
                  <div className="space-y-2">
                    <Textarea
                      value={foundation.conceptualFramework}
                      onChange={(e) => handleEdit('conceptualFramework', e.target.value)}
                      className="min-h-[300px] font-mono text-sm leading-relaxed"
                    />
                    <Button size="sm" onClick={() => toggleEdit('conceptualFramework')} className="gap-1">
                      <Check className="w-3 h-3" /> Guardar
                    </Button>
                  </div>
                ) : (
                  <div className="relative group">
                    <pre 
                      className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
                    >
                      {foundation.conceptualFramework}
                    </pre>
                    {!isLocked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEdit('conceptualFramework')}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-3 h-3 mr-1" /> Editar
                      </Button>
                    )}
                  </div>
                )}

                {/* Data Origin Traceability */}
                <div className="mt-6 pt-4 border-t border-amber-200">
                  <h5 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" style={{ color: bayerBlue }} />
                    Trazabilidad de Fuentes
                  </h5>
                  <div className="space-y-2">
                    {foundation.sources.map((source) => (
                      <div 
                        key={source.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <Quote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-foreground italic leading-relaxed">"{source.text}"</p>
                            <div className="mt-2 flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-blue-600">
                                <BookOpen className="w-3 h-3" />
                                {source.reference}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                <Brain className="w-3 h-3" />
                                {source.sourceAgent}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Coherence Score Widget */}
      <div 
        className="bg-white rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: coherenceCheck ? (coherenceCheck.score >= 80 ? '#10b981' : '#f59e0b') : '#e5e7eb', borderRadius: '12px' }}
      >
        <div 
          className="p-4 flex items-center justify-between"
          style={{ background: coherenceCheck ? (coherenceCheck.score >= 80 ? '#ecfdf5' : '#fffbeb') : '#f8fafc' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ background: coherenceCheck ? (coherenceCheck.score >= 80 ? '#10b981' : '#f59e0b') : '#64748b' }}
            >
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Score de Coherencia Global
              </h3>
              <p className="text-sm text-muted-foreground">
                Verificación de alineación entre componentes del protocolo
              </p>
            </div>
          </div>

          {!coherenceCheck ? (
            <Button
              onClick={runCoherenceCheck}
              disabled={isProcessing}
              variant="outline"
              className="gap-2"
              style={{ borderRadius: '12px' }}
            >
              <Gauge className="w-4 h-4" />
              Analizar Coherencia
            </Button>
          ) : (
            <div 
              className={cn(
                "text-4xl font-bold px-4 py-2 rounded-xl",
                coherenceCheck.score >= 80 ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {coherenceCheck.score}%
            </div>
          )}
        </div>

        {coherenceCheck && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Objectives Aligned */}
              <div className={cn(
                "p-4 rounded-xl border-2 text-center",
                coherenceCheck.objectivesAligned ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              )} style={{ borderRadius: '12px' }}>
                <div className={cn(
                  "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                  coherenceCheck.objectivesAligned ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {coherenceCheck.objectivesAligned ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">Objetivos ↔ Planteamiento</h4>
                <p className="text-xs text-muted-foreground">
                  {coherenceCheck.objectivesAligned ? 'Alineados' : 'Revisar'}
                </p>
              </div>

              {/* Search Strategy Aligned */}
              <div className={cn(
                "p-4 rounded-xl border-2 text-center",
                coherenceCheck.searchStrategyAligned ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              )} style={{ borderRadius: '12px' }}>
                <div className={cn(
                  "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                  coherenceCheck.searchStrategyAligned ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {coherenceCheck.searchStrategyAligned ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">Búsqueda ↔ Objetivos</h4>
                <p className="text-xs text-muted-foreground">
                  {coherenceCheck.searchStrategyAligned ? 'Coherente' : 'Desconexión'}
                </p>
              </div>

              {/* Methodology Consistent */}
              <div className={cn(
                "p-4 rounded-xl border-2 text-center",
                coherenceCheck.methodologyConsistent ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              )} style={{ borderRadius: '12px' }}>
                <div className={cn(
                  "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                  coherenceCheck.methodologyConsistent ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {coherenceCheck.methodologyConsistent ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">Metodología</h4>
                <p className="text-xs text-muted-foreground">
                  {coherenceCheck.methodologyConsistent ? 'Consistente' : 'Inconsistente'}
                </p>
              </div>
            </div>

            {/* Issues */}
            {coherenceCheck.issues.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl" style={{ borderRadius: '12px' }}>
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Incoherencias Detectadas
                </h4>
                <ul className="space-y-1">
                  {coherenceCheck.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coherenceCheck.score >= 80 && coherenceCheck.issues.length === 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center" style={{ borderRadius: '12px' }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-semibold text-emerald-700">Protocolo Coherente</h4>
                <p className="text-sm text-emerald-600">Todos los componentes están alineados correctamente</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Consolidate Protocol Button */}
      {isLocked && (
        <div className="flex justify-center">
          <Button
            onClick={exportProtocolDocument}
            size="lg"
            className="gap-3 h-16 px-10 text-lg font-bold text-white"
            style={{ 
              background: 'linear-gradient(135deg, #0033A0 0%, #0052cc 100%)',
              boxShadow: '0 8px 25px -5px rgba(0, 51, 160, 0.4)',
              borderRadius: '12px'
            }}
          >
            <Download className="w-6 h-6" />
            📄 CONSOLIDAR PROTOCOLO FINAL
            <span className="text-xs opacity-80 ml-2">Listo para Comité / Auditoría</span>
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Printer, ZoomIn, ZoomOut, ChevronLeft, 
  ChevronRight, CheckCircle, Shield, Award, BarChart2, BookOpen,
  Calendar, Users, Building2, Microscope, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import galateaLogo from '@/assets/galatea-logo.png';

interface PDFReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: {
    title: string;
    researchQuestion: string;
    generatedAt: Date;
    totalStudies: number;
    metaAnalysisStudies: number;
    validationScore: number;
  };
}

export function PDFReportViewer({ isOpen, onClose, reportData }: PDFReportViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 5;

  const defaultData = reportData || {
    title: 'Metformina y Neuroprotección en Pacientes con DM2: Una Revisión Sistemática y Meta-análisis',
    researchQuestion: '¿Reduce la metformina el riesgo de Alzheimer en adultos mayores con diabetes tipo 2 comparado con otros antidiabéticos orales?',
    generatedAt: new Date(),
    totalStudies: 1372,
    metaAnalysisStudies: 12,
    validationScore: 94.2
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-[#0097A7]" />
            <span className="font-semibold text-gray-900">Reporte de Evidencia Bayer-Galatea</span>
            <span className="text-sm text-gray-500">
              Generado: {defaultData.generatedAt.toLocaleDateString('es-ES', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-700 min-w-[3rem] text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(150, zoom + 25))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-700 min-w-[4rem] text-center">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Actions */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Imprimir</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0097A7] text-white rounded hover:bg-[#0097A7]/90 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Descargar PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto bg-gray-300 p-8">
          <div 
            className="mx-auto bg-white shadow-xl transition-transform"
            style={{ 
              width: `${(8.5 * 96 * zoom) / 100}px`,
              minHeight: `${(11 * 96 * zoom) / 100}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Page 1: Cover */}
            {currentPage === 1 && (
              <div className="p-12 h-full flex flex-col">
                {/* Header with Logos */}
                <div className="flex items-center justify-between mb-12">
                  <img src={galateaLogo} alt="Galatea AI" className="h-12 object-contain" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00D395] rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Validación IA</div>
                      <div className="text-lg font-bold text-[#00D395]">{defaultData.validationScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-8">
                    <div className="text-sm font-semibold text-[#0097A7] uppercase tracking-wider mb-3">
                      Revisión Sistemática y Meta-análisis
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                      {defaultData.title}
                    </h1>
                    <p className="text-lg text-gray-600 italic">
                      "{defaultData.researchQuestion}"
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <BookOpen className="w-4 h-4" />
                        Identificados
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{defaultData.totalStudies.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <BarChart2 className="w-4 h-4" />
                        Meta-análisis
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{defaultData.metaAnalysisStudies}</div>
                    </div>
                    <div className="p-4 bg-[#00D395]/10 rounded-lg border border-[#00D395]/20">
                      <div className="flex items-center gap-2 text-[#00D395] text-sm mb-1">
                        <Award className="w-4 h-4" />
                        Consenso
                      </div>
                      <div className="text-2xl font-bold text-[#00D395]">GOLD</div>
                    </div>
                  </div>
                </div>

                {/* AI Validation Seal */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-[#0097A7]/5 to-[#00D395]/5 rounded-lg">
                    <div className="w-16 h-16 border-4 border-[#0097A7] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-[#0097A7]" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Sello de Validación por IA</div>
                      <div className="text-lg font-bold text-[#0097A7]">Triple Verificación Independiente</div>
                      <div className="text-sm text-gray-600">Galatea AI • Audit GPT • Audit Gemini</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Generado automáticamente por Galatea AI</span>
                  <span>{defaultData.generatedAt.toISOString()}</span>
                </div>
              </div>
            )}

            {/* Page 2: Table of Contents */}
            {currentPage === 2 && (
              <div className="p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                  Índice Médico
                </h2>
                
                <div className="space-y-4">
                  {[
                    { num: '1', title: 'Resumen Ejecutivo', page: 3 },
                    { num: '2', title: 'Metodología de Búsqueda', page: 4, 
                      sub: ['2.1 Estrategia PICOT', '2.2 Ecuaciones de Búsqueda (Método Yadav 2025)', '2.3 Criterios de Elegibilidad'] },
                    { num: '3', title: 'Diagrama de Flujo PRISMA 2020', page: 7 },
                    { num: '4', title: 'Tabla de Artículos Excluidos', page: 8 },
                    { num: '5', title: 'Extracción de Datos', page: 10,
                      sub: ['5.1 Características de los Estudios', '5.2 Evaluación de Calidad (NOS)'] },
                    { num: '6', title: 'Meta-análisis', page: 14,
                      sub: ['6.1 Forest Plot - Riesgo de Demencia', '6.2 Análisis de Heterogeneidad', '6.3 Sesgo de Publicación'] },
                    { num: '7', title: 'Certificado de Rigor Científico', page: 18 },
                    { num: '8', title: 'Referencias', page: 19 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-[#0097A7]/10 text-[#0097A7] rounded-full flex items-center justify-center font-semibold text-sm">
                            {item.num}
                          </span>
                          <span className="font-medium text-gray-900">{item.title}</span>
                        </div>
                        <span className="text-gray-400">. . . . . . . . . . . . . . . . . . . . . {item.page}</span>
                      </div>
                      {item.sub && (
                        <div className="ml-12 space-y-1">
                          {item.sub.map((subItem, subIdx) => (
                            <div key={subIdx} className="text-sm text-gray-600 py-1">
                              {subItem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page 3: PRISMA Diagram Placeholder */}
            {currentPage === 3 && (
              <div className="p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Diagrama de Flujo PRISMA 2020
                </h2>
                
                {/* PRISMA Flow Visualization */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="space-y-4">
                    {/* Identification */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-800 mb-2">IDENTIFICACIÓN</div>
                      <div className="text-2xl font-bold text-blue-900">1,372 registros</div>
                      <div className="text-sm text-blue-600">De bases de datos: PubMed (623), Embase (412), Cochrane (189), Scopus (148)</div>
                    </div>
                    
                    <div className="text-center text-gray-400">↓</div>
                    
                    {/* Duplicates removed */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                        <div className="text-sm text-gray-600">Tras eliminar duplicados</div>
                        <div className="text-xl font-bold text-gray-900">1,063 registros únicos</div>
                      </div>
                      <div className="px-4 text-red-500">→ 309 duplicados</div>
                    </div>
                    
                    <div className="text-center text-gray-400">↓</div>
                    
                    {/* Screened */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-sm font-semibold text-purple-800 mb-2">CRIBADO</div>
                        <div className="text-xl font-bold text-purple-900">187 elegibles</div>
                      </div>
                      <div className="px-4 text-red-500">→ 876 excluidos por título/abstract</div>
                    </div>
                    
                    <div className="text-center text-gray-400">↓</div>
                    
                    {/* Full-text */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="text-sm text-orange-600">Texto completo evaluado</div>
                        <div className="text-xl font-bold text-orange-900">54 artículos</div>
                      </div>
                      <div className="px-4 text-red-500">→ 133 excluidos (ver tabla)</div>
                    </div>
                    
                    <div className="text-center text-gray-400">↓</div>
                    
                    {/* Included */}
                    <div className="p-4 bg-[#00D395]/10 border-2 border-[#00D395] rounded-lg">
                      <div className="text-sm font-semibold text-[#00D395] mb-2">INCLUIDOS</div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900">18 síntesis cualitativa</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">12 meta-análisis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 4: Forest Plot Preview */}
            {currentPage === 4 && (
              <div className="p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Forest Plot: Efecto de Metformina sobre Riesgo de Demencia
                </h2>
                
                {/* Forest Plot Representation */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="space-y-3">
                    {[
                      { study: 'Kuan et al. (2017)', hr: 0.76, ci: [0.63, 0.91], weight: 18.5 },
                      { study: 'Samaras et al. (2019)', hr: 0.84, ci: [0.72, 0.98], weight: 22.1 },
                      { study: 'Shi et al. (2018)', hr: 0.62, ci: [0.48, 0.79], weight: 15.3 },
                      { study: 'Orkaby et al. (2019)', hr: 0.82, ci: [0.68, 0.99], weight: 16.8 },
                      { study: 'López-Suárez (2020)', hr: 0.71, ci: [0.54, 0.92], weight: 12.4 },
                      { study: 'Moore et al. (2018)', hr: 0.69, ci: [0.58, 0.82], weight: 14.9 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-40 text-sm text-gray-700">{item.study}</div>
                        <div className="flex-1 relative h-6">
                          {/* Background grid line at 1.0 */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                          
                          {/* CI line */}
                          <div 
                            className="absolute top-1/2 h-0.5 bg-gray-600 -translate-y-1/2"
                            style={{
                              left: `${((item.ci[0] - 0.4) / 0.8) * 100}%`,
                              right: `${100 - ((item.ci[1] - 0.4) / 0.8) * 100}%`
                            }}
                          />
                          
                          {/* Point estimate */}
                          <div 
                            className="absolute top-1/2 w-3 h-3 bg-[#0097A7] transform -translate-x-1/2 -translate-y-1/2 rotate-45"
                            style={{ left: `${((item.hr - 0.4) / 0.8) * 100}%` }}
                          />
                        </div>
                        <div className="w-24 text-sm text-right font-mono">
                          {item.hr.toFixed(2)} [{item.ci[0].toFixed(2)}-{item.ci[1].toFixed(2)}]
                        </div>
                        <div className="w-16 text-sm text-right text-gray-500">
                          {item.weight}%
                        </div>
                      </div>
                    ))}
                    
                    {/* Overall effect */}
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-40 text-sm font-bold text-gray-900">OVERALL (I²=34%)</div>
                        <div className="flex-1 relative h-6">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                          <div 
                            className="absolute top-1/2 w-4 h-4 bg-[#00D395] transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${((0.74 - 0.4) / 0.8) * 100}%` }}
                          />
                        </div>
                        <div className="w-24 text-sm text-right font-mono font-bold">
                          0.74 [0.67-0.82]
                        </div>
                        <div className="w-16 text-sm text-right text-gray-500">
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Axis labels */}
                  <div className="flex justify-between mt-4 text-xs text-gray-500 pl-40 pr-24">
                    <span>0.4</span>
                    <span>Favorece Metformina ← 1.0 → Favorece Control</span>
                    <span>1.2</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#0097A7]/5 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Interpretación</h4>
                  <p className="text-sm text-gray-700">
                    El uso de metformina se asoció con una reducción significativa del 26% en el riesgo de demencia 
                    (HR 0.74; IC 95%: 0.67-0.82; p&lt;0.001). La heterogeneidad fue baja-moderada (I²=34%), 
                    sugiriendo consistencia en los hallazgos entre estudios.
                  </p>
                </div>
              </div>
            )}

            {/* Page 5: Scientific Rigor Certificate */}
            {currentPage === 5 && (
              <div className="p-12 h-full flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-lg">
                  {/* Certificate Border */}
                  <div className="border-4 border-double border-[#0097A7] p-8 rounded-lg">
                    <Award className="w-16 h-16 text-[#0097A7] mx-auto mb-4" />
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Certificado de Rigor Científico
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                      Este documento certifica que el presente protocolo de revisión sistemática 
                      ha sido validado mediante triple verificación independiente por IA.
                    </p>
                    
                    <div className="space-y-4 text-left mb-6">
                      <div className="flex items-center gap-3 p-3 bg-[#00D395]/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-[#00D395]" />
                        <div>
                          <div className="font-semibold text-gray-900">Galatea AI</div>
                          <div className="text-sm text-gray-600">Convergencia: 98.2%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#00D395]/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-[#00D395]" />
                        <div>
                          <div className="font-semibold text-gray-900">Audit GPT</div>
                          <div className="text-sm text-gray-600">Convergencia: 96.8%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#00D395]/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-[#00D395]" />
                        <div>
                          <div className="font-semibold text-gray-900">Audit Gemini</div>
                          <div className="text-sm text-gray-600">Convergencia: 97.1%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-3xl font-bold text-[#00D395] mb-2">
                        {defaultData.validationScore}%
                      </div>
                      <div className="text-sm text-gray-500 uppercase tracking-wider">
                        Convergencia Global
                      </div>
                    </div>
                    
                    <div className="mt-6 text-xs text-gray-400">
                      <p>Hash de integridad: sha256:7f8a9b2c...</p>
                      <p>Timestamp: {defaultData.generatedAt.toISOString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

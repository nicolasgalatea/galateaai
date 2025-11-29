import { Link } from 'react-router-dom';
import { 
  Search, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, 
  FileText, DollarSign, Clock, TrendingUp, Target, Zap,
  BarChart3, Activity, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MethodologyDiagnosis() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link 
            to="/#methodology" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Metodología
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              Paso 1 de 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Diagnóstico de <span className="text-primary">Cuellos de Botella</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Nuestra IA analiza cada proceso de su institución para identificar ineficiencias ocultas 
            que drenan recursos y generan pérdidas silenciosas.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">45%</p>
              <p className="text-sm text-muted-foreground">Ineficiencia Promedio Detectada</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">72h</p>
              <p className="text-sm text-muted-foreground">Tiempo de Análisis</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">100%</p>
              <p className="text-sm text-muted-foreground">Procesos Mapeados</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Cómo Funciona en su Institución</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Process Mining Visualization */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Process Mining Dashboard
              </h3>
              
              {/* Flowchart */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 mt-2">Admisión</span>
                </div>
                
                <ArrowRight className="w-5 h-5 text-slate-600" />
                
                <div className="flex flex-col items-center relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <AlertTriangle className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-primary mt-2">Facturación</span>
                </div>
                
                <ArrowRight className="w-5 h-5 text-slate-600" />
                
                <div className="flex flex-col items-center relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-xs text-amber-400 mt-2">Autorización</span>
                </div>
                
                <ArrowRight className="w-5 h-5 text-slate-600" />
                
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs text-slate-400 mt-2">Cobro</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <p className="text-slate-400 text-xs">Cuellos Detectados</p>
                  <p className="text-xl font-bold text-primary">2</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <p className="text-slate-400 text-xs">Potencial de Ahorro</p>
                  <p className="text-xl font-bold text-green-400">$2.3M</p>
                </div>
              </div>
            </div>

            {/* Integration Steps */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Conexión a Sistemas</h4>
                    <p className="text-sm text-muted-foreground">
                      Nos conectamos a su ERP, HIS y sistemas de facturación para extraer logs de eventos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Análisis de Process Mining</h4>
                    <p className="text-sm text-muted-foreground">
                      Nuestra IA reconstruye el flujo real de cada proceso e identifica desviaciones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Reporte de Hallazgos</h4>
                    <p className="text-sm text-muted-foreground">
                      Entregamos un mapa visual con puntos críticos priorizados por impacto financiero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Retorno de Inversión</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Identificación Precisa</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Detectamos el 100% de los cuellos de botella que causan glosas y demoras en pagos.
              </p>
              <p className="text-2xl font-bold text-primary">$500K - $2M</p>
              <p className="text-xs text-muted-foreground">Recuperación potencial anual</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6">
              <Clock className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Reducción de Tiempos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Aceleramos el ciclo de facturación hasta en un 60% eliminando pasos redundantes.
              </p>
              <p className="text-2xl font-bold text-amber-400">-60%</p>
              <p className="text-xs text-muted-foreground">Tiempo de ciclo</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Mejora Continua</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Monitoreo en tiempo real que detecta nuevas ineficiencias antes de que impacten.
              </p>
              <p className="text-2xl font-bold text-green-400">24/7</p>
              <p className="text-xs text-muted-foreground">Vigilancia activa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Caso de Estudio</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              Hospital Regional del Norte - 450 camas
            </h3>
            
            <p className="text-muted-foreground mb-6">
              "El diagnóstico de Galatea reveló que el 35% de nuestras glosas se originaban en un solo 
              punto del proceso de autorización. Corregirlo nos recuperó $1.8M en el primer trimestre."
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">35%</p>
                <p className="text-xs text-muted-foreground">Glosas Identificadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">$1.8M</p>
                <p className="text-xs text-muted-foreground">Recuperado Q1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">72h</p>
                <p className="text-xs text-muted-foreground">Tiempo de Diagnóstico</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <Link to="/#methodology">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            
            <Link to="/methodology/integration">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                Siguiente: Integración
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

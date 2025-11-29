import { Link } from 'react-router-dom';
import { 
  TrendingUp, ArrowLeft, ArrowRight, DollarSign, Clock,
  Users, Zap, Activity, Target, Shield, Building2,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MethodologyControl() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-background to-background" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link 
            to="/#methodology" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Metodología
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="px-4 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
              Paso 4 de 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Control & <span className="text-green-400">Rentabilidad</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Visibilidad ejecutiva en tiempo real del impacto financiero y operativo. 
            Dashboards que demuestran ROI cada día.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">$150M</p>
              <p className="text-sm text-muted-foreground">Cash Flow Recuperado</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">4,000h</p>
              <p className="text-sm text-muted-foreground">Horas Ahorradas</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">340%</p>
              <p className="text-sm text-muted-foreground">ROI Promedio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Dashboard */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Dashboard Ejecutivo</h2>
          
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Live Data</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400 text-xs">Ingresos Recuperados</span>
                </div>
                <p className="text-2xl font-bold text-green-400">$150M</p>
                <p className="text-green-400/70 text-xs mt-1">↑ 23% vs trimestre anterior</p>
              </div>
              
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-slate-400 text-xs">Horas Admin Ahorradas</span>
                </div>
                <p className="text-2xl font-bold text-primary">4,000</p>
                <p className="text-primary/70 text-xs mt-1">↑ 156 esta semana</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Agentes Activos</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">12</p>
                <p className="text-purple-400/70 text-xs mt-1">100% uptime</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400 text-xs">Tareas Completadas</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">2.3M</p>
                <p className="text-amber-400/70 text-xs mt-1">Este mes</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm font-medium">Impacto Mensual en Ingresos</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-slate-400 text-xs">Recuperado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-slate-400 text-xs">Proyectado</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between h-32 gap-2">
                {[35, 45, 40, 55, 60, 75, 85, 90, 88, 95, 100, 110].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-green-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-slate-500 text-[10px]">
                      {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Indicator */}
            <div className="bg-gradient-to-r from-green-500/20 via-primary/20 to-purple-500/20 rounded-lg p-4 border border-green-500/30 text-center">
              <p className="text-slate-400 text-sm mb-1">Retorno sobre Inversión (ROI)</p>
              <p className="text-4xl font-bold text-green-400">340%</p>
              <p className="text-slate-500 text-xs mt-1">Calculado en base a costos operativos vs valor recuperado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Breakdown */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Métricas que Demuestran Valor</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <BarChart3 className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Métricas Financieras</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Cash flow recuperado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Reducción de glosas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Días de cartera
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Costo por transacción
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <PieChart className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Métricas Operativas</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Tiempo de ciclo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Tasa de automatización
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Volumen procesado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Tasa de errores
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <LineChart className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Métricas de Productividad</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Horas FTE ahorradas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Tareas por agente
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Tiempo de respuesta
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Satisfacción del equipo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Cálculo de ROI Típico</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Inversión</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Licencia Galatea (anual)</span>
                  <span className="font-medium text-foreground">$120,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Implementación</span>
                  <span className="font-medium text-foreground">$30,000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-foreground">Total Inversión</span>
                  <span className="font-bold text-foreground">$150,000</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Retorno (Año 1)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Glosas recuperadas</span>
                  <span className="font-medium text-green-400">+$280,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Ahorro en personal</span>
                  <span className="font-medium text-green-400">+$180,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Reducción errores</span>
                  <span className="font-medium text-green-400">+$50,000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-foreground">Total Retorno</span>
                  <span className="font-bold text-green-400">$510,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-xl p-6 border border-green-500/30 text-center">
            <p className="text-muted-foreground mb-2">ROI Neto Año 1</p>
            <p className="text-4xl font-bold text-green-400 mb-1">340%</p>
            <p className="text-sm text-muted-foreground">($510,000 - $150,000) / $150,000 × 100</p>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Caso de Estudio</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              Grupo Hospitalario del Caribe - 8 instituciones
            </h3>
            
            <p className="text-muted-foreground mb-6">
              "El dashboard de Galatea nos da visibilidad que nunca habíamos tenido. Podemos mostrar 
              al board exactamente cuánto recuperamos cada mes y el ROI de cada agente desplegado."
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">$4.2M</p>
                <p className="text-xs text-muted-foreground">Recuperado Año 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">420%</p>
                <p className="text-xs text-muted-foreground">ROI</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Agentes Desplegados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-green-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            ¿Listo para Transformar sus Operaciones?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Agende una demostración personalizada y vea cómo Galatea puede generar ROI 
            para su institución desde el primer mes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                Agendar Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="gap-2">
                Ver Precios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <Link to="/methodology/deployment">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Anterior: Despliegue
              </Button>
            </Link>
            
            <Link to="/#methodology">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                Ver Metodología Completa
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

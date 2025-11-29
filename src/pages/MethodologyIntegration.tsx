import { Link } from 'react-router-dom';
import { 
  Cable, ArrowLeft, ArrowRight, CheckCircle, Shield,
  Server, Database, Lock, Zap, Clock, TrendingUp, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const integrations = [
  { name: 'SAP', status: 'connected', type: 'ERP' },
  { name: 'Veeva', status: 'connected', type: 'CRM' },
  { name: 'Servinte', status: 'connected', type: 'HIS' },
  { name: 'Epic', status: 'connected', type: 'EHR' },
  { name: 'Oracle', status: 'pending', type: 'Finance' },
  { name: 'Dynamics', status: 'connected', type: 'ERP' },
];

export default function MethodologyIntegration() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-background" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link 
            to="/#methodology" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Metodología
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Cable className="w-8 h-8 text-blue-400" />
            </div>
            <div className="px-4 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium">
              Paso 2 de 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Integración de <span className="text-blue-400">Flujos de Trabajo</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Conexión segura y sin fricción con su infraestructura legacy. 
            Galatea se adapta a sus sistemas, no al revés.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">50+</p>
              <p className="text-sm text-muted-foreground">Conectores Nativos</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">48h</p>
              <p className="text-sm text-muted-foreground">Tiempo de Integración</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">0</p>
              <p className="text-sm text-muted-foreground">Downtime Requerido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Hub Visualization */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Hub de Integraciones</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visual Hub */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                Arquitectura de Conexión
              </h3>
              
              <div className="relative py-8">
                <div className="flex items-center justify-center">
                  {/* Left Systems */}
                  <div className="flex flex-col gap-3">
                    {integrations.slice(0, 3).map((int, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-center min-w-[80px]">
                          <span className="text-white font-medium text-sm">{int.name}</span>
                          <p className="text-slate-500 text-xs">{int.type}</p>
                        </div>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Central Galatea Node */}
                  <div className="mx-4 relative">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-primary rounded-full flex items-center justify-center border-4 border-blue-500/50">
                      <span className="text-white font-bold text-sm">Galatea</span>
                    </div>
                  </div>

                  {/* Right Systems */}
                  <div className="flex flex-col gap-3">
                    {integrations.slice(3).map((int, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-gradient-to-l from-green-500 to-blue-500 relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-center min-w-[80px]">
                          <span className="text-white font-medium text-sm">{int.name}</span>
                          <p className="text-slate-500 text-xs">{int.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {integrations.map((int, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                    <p className="text-white text-xs font-medium">{int.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        int.status === 'connected' ? "bg-green-500" : "bg-yellow-500"
                      )} />
                      <span className={cn(
                        "text-[10px]",
                        int.status === 'connected' ? "text-green-400" : "text-yellow-400"
                      )}>
                        {int.status === 'connected' ? 'API Segura' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Steps */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Mapeo de Datos</h4>
                    <p className="text-sm text-muted-foreground">
                      Identificamos las estructuras de datos de sus sistemas y creamos mapeos automáticos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Conexión Segura</h4>
                    <p className="text-sm text-muted-foreground">
                      APIs encriptadas con certificación SOC 2 Type II y cumplimiento HIPAA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Sincronización en Tiempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      Flujo bidireccional de datos con latencia menor a 100ms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Validación Continua</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitoreo 24/7 de la integridad de las conexiones con alertas automáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Systems */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Sistemas Compatibles</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { category: 'ERP', systems: ['SAP', 'Oracle', 'Dynamics', 'Infor'] },
              { category: 'HIS/EHR', systems: ['Epic', 'Cerner', 'Servinte', 'MEDIFOLIOS'] },
              { category: 'Facturación', systems: ['Quirón', 'HMS', 'Helisa', 'Siigo'] },
              { category: 'Laboratorio', systems: ['LabWare', 'SoftLab', 'Modulab', 'Werfen'] },
            ].map((cat, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.systems.map((sys, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {sys}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Retorno de Inversión</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6">
              <Clock className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Implementación Rápida</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Integración completa en 48 horas sin interrumpir operaciones.
              </p>
              <p className="text-2xl font-bold text-blue-400">48h</p>
              <p className="text-xs text-muted-foreground">Go-live promedio</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Eficiencia Operativa</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Eliminamos la doble digitación y errores de transcripción.
              </p>
              <p className="text-2xl font-bold text-green-400">-85%</p>
              <p className="text-xs text-muted-foreground">Errores manuales</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6">
              <Shield className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Cumplimiento Garantizado</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Trazabilidad completa de cada transacción para auditorías.
              </p>
              <p className="text-2xl font-bold text-purple-400">100%</p>
              <p className="text-xs text-muted-foreground">Audit trail</p>
            </div>
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
              Clínica del Valle - Multi-sede
            </h3>
            
            <p className="text-muted-foreground mb-6">
              "Integramos Galatea con nuestro SAP y Servinte en menos de 3 días. Ahora toda la 
              información fluye automáticamente y eliminamos 200 horas mensuales de trabajo manual."
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">3 días</p>
                <p className="text-xs text-muted-foreground">Implementación</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">200h</p>
                <p className="text-xs text-muted-foreground">Ahorro Mensual</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Sistemas Conectados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <Link to="/methodology/diagnosis">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Anterior: Diagnóstico
              </Button>
            </Link>
            
            <Link to="/methodology/deployment">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                Siguiente: Despliegue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

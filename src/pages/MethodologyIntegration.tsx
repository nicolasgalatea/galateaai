import { Link } from 'react-router-dom';
import { 
  Cable, ArrowLeft, ArrowRight, CheckCircle, Shield,
  Server, Database, Lock, Zap, Clock, TrendingUp, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const integrations = [
  { name: 'SAP', status: 'connected', type: 'ERP' },
  { name: 'Veeva', status: 'connected', type: 'CRM' },
  { name: 'Servinte', status: 'connected', type: 'HIS' },
  { name: 'Epic', status: 'connected', type: 'EHR' },
  { name: 'Oracle', status: 'pending', type: 'Finance' },
  { name: 'Dynamics', status: 'connected', type: 'ERP' },
];

export default function MethodologyIntegration() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link 
            to="/#methodology" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('methodology.backTo')}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Cable className="w-8 h-8 text-primary" />
            </div>
            <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              {t('methodology.step')} 2 {t('methodology.of')} 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('methodology.integration.title')} <span className="text-primary">{t('methodology.integration.titleHighlight')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            {t('methodology.integration.subtitle')}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{t('methodology.integration.stat1.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.integration.stat1.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{t('methodology.integration.stat2.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.integration.stat2.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{t('methodology.integration.stat3.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.integration.stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Hub Visualization */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.integration.hub')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visual Hub */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
              <h3 className="text-foreground font-semibold mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                {t('methodology.integration.architecture')}
              </h3>
              
              <div className="relative py-6">
                <div className="flex items-center justify-center">
                  {/* Left Systems */}
                  <div className="flex flex-col gap-4">
                    {integrations.slice(0, 3).map((int, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="bg-muted border border-border rounded-xl px-4 py-2.5 text-center min-w-[90px] hover:border-primary/30 transition-all">
                          <span className="text-foreground font-semibold text-sm">{int.name}</span>
                          <p className="text-muted-foreground text-[10px] mt-0.5">{int.type}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 md:w-10 h-0.5 bg-gradient-to-r from-border to-green-500" />
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Central Galatea Node */}
                  <div className="mx-3 md:mx-6 relative">
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl animate-pulse scale-150" />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-full flex items-center justify-center border-4 border-primary/30 shadow-2xl shadow-primary/30">
                      <span className="text-white font-bold text-sm md:text-base">Galatea</span>
                    </div>
                  </div>

                  {/* Right Systems */}
                  <div className="flex flex-col gap-4">
                    {integrations.slice(3).map((int, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-lg",
                            int.status === 'connected' 
                              ? "bg-green-500 animate-pulse shadow-green-500/50" 
                              : "bg-yellow-500 animate-pulse shadow-yellow-500/50"
                          )} />
                          <div className={cn(
                            "w-6 md:w-10 h-0.5",
                            int.status === 'connected' 
                              ? "bg-gradient-to-l from-border to-green-500"
                              : "bg-gradient-to-l from-border to-yellow-500"
                          )} />
                        </div>
                        <div className="bg-muted border border-border rounded-xl px-4 py-2.5 text-center min-w-[90px] hover:border-primary/30 transition-all">
                          <span className="text-foreground font-semibold text-sm">{int.name}</span>
                          <p className="text-muted-foreground text-[10px] mt-0.5">{int.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                {integrations.map((int, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-3 border border-border hover:border-primary/30 transition-all">
                    <p className="text-foreground text-sm font-semibold">{int.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        int.status === 'connected' ? "bg-green-500" : "bg-yellow-500"
                      )} />
                      <span className={cn(
                        "text-xs",
                        int.status === 'connected' ? "text-green-600" : "text-yellow-600"
                      )}>
                        {int.status === 'connected' ? t('methodology.integration.secureApi') : t('methodology.integration.pending')}
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
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('methodology.integration.step1.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('methodology.integration.step1.desc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('methodology.integration.step2.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('methodology.integration.step2.desc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('methodology.integration.step3.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('methodology.integration.step3.desc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('methodology.integration.step4.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('methodology.integration.step4.desc')}
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
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.integration.systems')}</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { category: 'ERP', systems: ['SAP', 'Oracle', 'Dynamics', 'Infor'] },
              { category: 'HIS/EHR', systems: ['Epic', 'Cerner', 'Servinte', 'MEDIFOLIOS'] },
              { category: t('methodology.integration.billing'), systems: ['Quirón', 'HMS', 'Helisa', 'Siigo'] },
              { category: t('methodology.integration.laboratory'), systems: ['LabWare', 'SoftLab', 'Modulab', 'Werfen'] },
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
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.roi')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.integration.roi1.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.integration.roi1.desc')}
              </p>
              <p className="text-2xl font-bold text-primary">{t('methodology.integration.roi1.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.integration.roi1.label')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.integration.roi2.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.integration.roi2.desc')}
              </p>
              <p className="text-2xl font-bold text-green-400">{t('methodology.integration.roi2.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.integration.roi2.label')}</p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.integration.roi3.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.integration.roi3.desc')}
              </p>
              <p className="text-2xl font-bold text-primary">{t('methodology.integration.roi3.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.integration.roi3.label')}</p>
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
              <span className="text-sm text-muted-foreground">{t('methodology.caseStudy')}</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              {t('methodology.integration.case.title')}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {t('methodology.integration.case.quote')}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">3 días</p>
                <p className="text-xs text-muted-foreground">{t('methodology.integration.case.stat1')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">200h</p>
                <p className="text-xs text-muted-foreground">{t('methodology.integration.case.stat2')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">{t('methodology.integration.case.stat3')}</p>
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
                {t('methodology.integration.nav.prev')}
              </Button>
            </Link>
            
            <Link to="/methodology/deployment">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                {t('methodology.integration.nav.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

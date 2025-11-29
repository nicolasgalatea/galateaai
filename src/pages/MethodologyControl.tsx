import { Link } from 'react-router-dom';
import { 
  TrendingUp, ArrowLeft, ArrowRight, DollarSign, Clock,
  Users, Zap, Activity, Building2,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MethodologyControl() {
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
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              {t('methodology.step')} 4 {t('methodology.of')} 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('methodology.control.title')} <span className="text-primary">{t('methodology.control.titleHighlight')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            {t('methodology.control.subtitle')}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{t('methodology.control.stat1.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.control.stat1.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{t('methodology.control.stat2.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.control.stat2.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{t('methodology.control.stat3.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.control.stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Dashboard */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.control.dashboard')}</h2>
          
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            {/* Header with window controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">{t('methodology.control.liveData')}</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground text-xs">{t('methodology.control.revenueRecovered')}</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-600">$150M</p>
                <p className="text-green-600/70 text-xs mt-2 flex items-center gap-1">
                  <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-green-600" />
                  23% {t('methodology.control.vsLastQuarter')}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/30 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground text-xs">{t('methodology.control.adminHoursSaved')}</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-primary">4,000</p>
                <p className="text-primary/70 text-xs mt-2 flex items-center gap-1">
                  <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-primary" />
                  156 {t('methodology.control.thisWeek')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/30 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground text-xs">{t('methodology.control.activeAgents')}</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-primary">12</p>
                <p className="text-primary/70 text-xs mt-2">100% {t('methodology.control.uptime')}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl p-4 border border-amber-500/30 hover:border-amber-500/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-muted-foreground text-xs">{t('methodology.control.tasksCompleted')}</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-amber-600">2.3M</p>
                <p className="text-amber-600/70 text-xs mt-2">{t('methodology.control.thisMonth')}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-muted/50 rounded-xl p-5 border border-border mb-5">
              <div className="flex items-center justify-between mb-5">
                <span className="text-foreground text-sm font-semibold">{t('methodology.control.monthlyImpact')}</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                    <span className="text-muted-foreground text-xs">{t('methodology.control.recovered')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                    <span className="text-muted-foreground text-xs">{t('methodology.control.projected')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between h-36 gap-2">
                {[35, 45, 40, 55, 60, 75, 85, 90, 88, 95, 100, 110].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-gradient-to-t from-primary via-primary/80 to-green-500 rounded-t-md transition-all group-hover:shadow-lg group-hover:shadow-primary/30"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Indicator */}
            <div className="bg-gradient-to-r from-green-500/20 via-primary/10 to-primary/20 rounded-xl p-6 border border-green-500/30 text-center">
              <p className="text-muted-foreground text-sm mb-2">{t('methodology.control.roiIndicator')}</p>
              <p className="text-5xl font-bold text-green-600 mb-1">340%</p>
              <p className="text-muted-foreground text-xs">{t('methodology.control.roiCalculation')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Breakdown */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.control.metrics')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <BarChart3 className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.control.financialMetrics')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {t('methodology.control.cashFlowRecovered')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {t('methodology.control.denialReduction')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {t('methodology.control.daysInAR')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {t('methodology.control.costPerTransaction')}
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <PieChart className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.control.operationalMetrics')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.cycleTime')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.automationRate')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.volumeProcessed')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.errorRate')}
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <LineChart className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.control.productivityMetrics')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.fteHoursSaved')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.tasksPerAgent')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.responseTime')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t('methodology.control.teamSatisfaction')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.control.roiCalculator')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('methodology.control.investment')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('methodology.control.galateaLicense')}</span>
                  <span className="font-medium text-foreground">$120,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('methodology.control.implementation')}</span>
                  <span className="font-medium text-foreground">$30,000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-foreground">{t('methodology.control.totalInvestment')}</span>
                  <span className="font-bold text-foreground">$150,000</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('methodology.control.returnYear1')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('methodology.control.denialsRecovered')}</span>
                  <span className="font-medium text-green-400">+$280,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('methodology.control.staffSavings')}</span>
                  <span className="font-medium text-green-400">+$180,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('methodology.control.errorReduction')}</span>
                  <span className="font-medium text-green-400">+$50,000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-foreground">{t('methodology.control.totalReturn')}</span>
                  <span className="font-bold text-green-400">$510,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-xl p-6 border border-green-500/30 text-center">
            <p className="text-muted-foreground mb-2">{t('methodology.control.netRoiYear1')}</p>
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
              <span className="text-sm text-muted-foreground">{t('methodology.caseStudy')}</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              {t('methodology.control.case.title')}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {t('methodology.control.case.quote')}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">$4.2M</p>
                <p className="text-xs text-muted-foreground">{t('methodology.control.case.stat1')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">420%</p>
                <p className="text-xs text-muted-foreground">{t('methodology.control.case.stat2')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">{t('methodology.control.case.stat3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {t('methodology.control.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('methodology.control.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                {t('methodology.control.cta.demo')}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="gap-2">
                {t('methodology.control.cta.pricing')}
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
                {t('methodology.control.nav.prev')}
              </Button>
            </Link>
            
            <Link to="/">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                {t('methodology.control.nav.home')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

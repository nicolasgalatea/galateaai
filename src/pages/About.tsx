import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Building2, Telescope, ShieldAlert, Network, Zap, Server, UserCheck, Gauge } from 'lucide-react';
import { FoundingTeam } from '@/components/FoundingTeam';

export default function About() {
  const { t } = useLanguage();
  useScrollReveal();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative pt-32 pb-20 px-4 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Page Title */}
          <div className="text-center mb-16 scroll-reveal">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('about.title')}
            </h1>
          </div>

          {/* Section 1: Mission & Vision - Foundational Pillars */}
          <section className="mb-20" id="mission-vision">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mission Block */}
              <div className="scroll-reveal group">
                <div className="relative h-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />
                  
                  <div className="p-8 lg:p-10">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6 tracking-tight">
                      Our mission
                    </h2>
                    
                    {/* Content */}
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                      To engineer the sovereign infrastructure that powers the next generation of healthcare operations. We exist to transform administrative friction into automated value by deploying secure, compliant, and autonomous AI agents that integrate seamlessly into the daily workflows of hospitals, pharma, and payers.
                    </p>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full opacity-50" />
                </div>
              </div>

              {/* Vision Block */}
              <div className="scroll-reveal group" style={{ animationDelay: '0.15s' }}>
                <div className="relative h-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-primary/60 to-primary" />
                  
                  <div className="p-8 lg:p-10">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Telescope className="w-8 h-8 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6 tracking-tight">
                      Our vision
                    </h2>
                    
                    {/* Content */}
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                      To democratize intelligence across the global health ecosystem. We envision a future where any professional—clinical, financial, or administrative—can design, orchestrate, and deploy their own digital workforce in minutes, creating a self-optimizing system where technology handles the complexity, and humans focus on care.
                    </p>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-tr-full opacity-50" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Problem, Solution & Opportunity - Enterprise 3-Column */}
          <section className="mb-20" id="enterprise-value">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* THE PROBLEM */}
              <div className="scroll-reveal group">
                <div className="relative h-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-destructive/5 hover:-translate-y-1">
                  {/* Top accent bar - Red for Problem */}
                  <div className="h-1 bg-gradient-to-r from-destructive to-destructive/60" />
                  
                  <div className="p-6 lg:p-8">
                    {/* Label */}
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-destructive/80 mb-4">
                      The problem
                    </span>
                    
                    {/* Headline */}
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-6 leading-tight">
                      "Operational paralysis" in regulated environments
                    </h3>
                    
                    {/* Key Points */}
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Network className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Integration failure</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">95% of AI pilots fail due to lack of workflow integration.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ShieldAlert className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Data sovereignty risks</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Generic models expose sensitive IP and patient data.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Gauge className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Manual regulatory friction</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Critical compliance tasks remain slow and error-prone.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE SOLUTION */}
              <div className="scroll-reveal group" style={{ animationDelay: '0.1s' }}>
                <div className="relative h-full bg-white dark:bg-card rounded-2xl border border-primary/30 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  {/* Top accent bar - Primary Teal for Solution */}
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
                  
                  <div className="p-6 lg:p-8">
                    {/* Label */}
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">
                      The solution
                    </span>
                    
                    {/* Headline */}
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-6 leading-tight">
                      Sovereign health-ops infrastructure
                    </h3>
                    
                    {/* Key Points */}
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Server className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Sovereign tech</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Natively trained on local compliance & regulations.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Network className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Deep integration</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Seamless connection with legacy cores (Veeva, SAP, HIS).</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserCheck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">"Human-in-the-loop" security</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">AI processes volume; experts validate critical decisions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE OPPORTUNITY */}
              <div className="scroll-reveal group" style={{ animationDelay: '0.2s' }}>
                <div className="relative h-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  {/* Top accent bar - Gradient for Opportunity */}
                  <div className="h-1 bg-gradient-to-r from-primary/60 to-green-500" />
                  
                  <div className="p-6 lg:p-8">
                    {/* Label */}
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-600 dark:text-green-500 mb-4">
                      The opportunity
                    </span>
                    
                    {/* Headline */}
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-6 leading-tight">
                      Total operational autonomy
                    </h3>
                    
                    {/* Key Points */}
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Deployment speed</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Go from concept to production in weeks, not years.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Network className="w-4 h-4 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Multi-vertical scalability</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">One platform for pharma, providers, and payers.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Gauge className="w-4 h-4 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm mb-1">Immediate cost efficiency</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">Transform fixed administrative costs into scalable ROI.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </section>

          {/* Section 3: Founding Team */}
          <FoundingTeam />

        </div>
      </main>

      <Footer />
    </div>
  );
}

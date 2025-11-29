import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Mic, Shield, Scissors, FlaskConical, Code, FileText, FileSignature, FileStack, Scale, FileSearch, ClipboardCheck, BookOpen, Heart, Eye, Receipt, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tag color mapping for enterprise categories
const tagColors: Record<string, string> = {
  'CLINICAL': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'COMPLIANCE': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'FINANCE': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'OPS': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'EFFICIENCY': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'LEGAL': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'RESEARCH': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'AUDIT': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'PHARMA': 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  'SURGICAL': 'bg-red-500/20 text-red-300 border-red-500/30',
};

const agents = [{
  key: 'aorta',
  icon: Heart,
  link: '/agent/aorta',
  category: 'Clinical Specialties',
  tag: 'CLINICAL'
}, {
  key: 'ojos',
  icon: Eye,
  link: '/agent/ojos',
  category: 'Clinical Specialties',
  tag: 'CLINICAL'
}, {
  key: 'clinicalDictation',
  icon: Mic,
  link: '/agent/clinical-dictation',
  category: 'Documentation',
  tag: 'EFFICIENCY'
}, {
  key: 'compliance',
  icon: Shield,
  link: '/agent/compliance',
  category: 'Legal & Compliance',
  tag: 'AUDIT'
}, {
  key: 'surgicalNotes',
  icon: Scissors,
  link: '/agent/surgical-notes',
  category: 'Surgical',
  tag: 'SURGICAL'
}, {
  key: 'research',
  icon: FlaskConical,
  link: '/agent/research',
  category: 'Research',
  tag: 'RESEARCH'
}, {
  key: 'coding',
  icon: Code,
  link: '/agent/coding',
  category: 'Coding & Billing',
  tag: 'COMPLIANCE',
  featured: true
}, {
  key: 'administration',
  icon: FileText,
  link: '/agent/administration',
  category: 'Administrative',
  tag: 'OPS'
}, {
  key: 'consent',
  icon: FileSignature,
  link: '/agent/consent',
  category: 'Legal & Compliance',
  tag: 'LEGAL'
}, {
  key: 'summary',
  icon: FileStack,
  link: '/agent/summary',
  category: 'Documentation',
  tag: 'CLINICAL'
}, {
  key: 'legalReview',
  icon: Scale,
  link: '/agent/legal-review',
  category: 'Legal & Compliance',
  tag: 'LEGAL'
}, {
  key: 'protocolReview',
  icon: FileSearch,
  link: '/agent/protocol-review',
  category: 'Research',
  tag: 'PHARMA'
}, {
  key: 'surgicalProtocols',
  icon: ClipboardCheck,
  link: '/agent/surgical-protocols',
  category: 'Surgical',
  tag: 'SURGICAL'
}, {
  key: 'logbook',
  icon: BookOpen,
  link: '/agent/logbook',
  category: 'Surgical',
  tag: 'SURGICAL'
}, {
  key: 'billing',
  icon: Receipt,
  link: '/agent/billing',
  category: 'Coding & Billing',
  tag: 'FINANCE'
}];

const categories = ['All', 'Clinical Specialties', 'Documentation', 'Surgical', 'Legal & Compliance', 'Research', 'Administrative', 'Coding & Billing'];

export default function Agents() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter and sort agents alphabetically
  const filteredAgents = useMemo(() => {
    const filtered = agents.filter(agent => {
      const matchesSearch = t(`agents.${agent.key}.name`).toLowerCase().includes(searchQuery.toLowerCase()) || 
        t(`agents.${agent.key}.desc`).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    // Sort alphabetically by translated name
    return filtered.sort((a, b) => 
      t(`agents.${a.key}.name`).localeCompare(t(`agents.${b.key}.name`))
    );
  }, [searchQuery, selectedCategory, t]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredAgents.length) {
          setVisibleCount(prev => Math.min(prev + 20, filteredAgents.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredAgents.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, selectedCategory]);

  const visibleAgents = filteredAgents.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <Header />

      <div className="flex-1 flex pt-20">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="sticky top-20 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3 tracking-tight">{t('agents.title')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('agents.subtitle')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={t('agents.search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-border/50"
              />
            </div>

            {/* Category Filters */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('agents.categories.label')}</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(`agents.categories.${category.toLowerCase().replace(/\s+/g, '_').replace('&', 'and')}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Mobile Search & Filters */}
            <div className="lg:hidden mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={t('agents.search')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {t(`agents.categories.${category.toLowerCase().replace(/\s+/g, '_').replace('&', 'and')}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Agent Foundry CTA - Premium Dark Teal */}
            <Link to="/custom-agent" className="block mb-10">
              <Card className="cursor-pointer border-0 bg-gradient-to-r from-[#00626d] via-[#007a87] to-[#00626d] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptLTYgNmgtNnY2aDZ2LTZ6bTAgMGg2djZoLTZ2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                <div className="p-6 flex items-center gap-5 relative z-10">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white mb-1">
                      {t('agents.foundry.title')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('agents.foundry.desc')}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium group-hover:bg-white/20 transition-colors">
                      {t('agents.foundry.cta')}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Agents Grid - Enterprise Module Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleAgents.map(agent => (
                <Link key={agent.key} to={agent.link}>
                  <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur group ${
                    (agent as any).featured ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/10' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                          (agent as any).featured 
                            ? 'bg-primary/20 group-hover:bg-primary/30' 
                            : 'bg-muted group-hover:bg-muted/80'
                        }`}>
                          {agent.icon && <agent.icon className={`w-5 h-5 ${(agent as any).featured ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={1.5} />}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold tracking-wider border ${tagColors[agent.tag] || 'bg-muted text-muted-foreground'}`}
                        >
                          {agent.tag}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {t(`agents.${agent.key}.name`)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {t(`agents.${agent.key}.desc`)}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-muted/50">
                          {t(`agents.${agent.key}.specialty`)}
                        </Badge>
                        {(agent as any).featured && (
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                            {t('agents.featured')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Trigger */}
            {visibleCount < filteredAgents.length && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                <div className="animate-pulse text-muted-foreground">{t('agents.loading')}</div>
              </div>
            )}

            {filteredAgents.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">{t('agents.noResults')}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

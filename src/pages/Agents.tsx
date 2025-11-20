import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Mic, Shield, Scissors, FlaskConical, Code, FileText, FileSignature, FileStack, Scale, FileSearch, ClipboardCheck, BookOpen, Heart, Eye, Receipt } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
const agents = [{
  key: 'aorta',
  icon: Heart,
  link: '/agent/aorta',
  category: 'Clinical Specialties'
}, {
  key: 'ojos',
  icon: Eye,
  link: '/agent/ojos',
  category: 'Clinical Specialties'
}, {
  key: 'clinicalDictation',
  icon: Mic,
  link: '/agent/clinical-dictation',
  category: 'Documentation'
}, {
  key: 'compliance',
  icon: Shield,
  link: '/agent/compliance',
  category: 'Legal & Compliance'
}, {
  key: 'surgicalNotes',
  icon: Scissors,
  link: '/agent/surgical-notes',
  category: 'Surgical'
}, {
  key: 'research',
  icon: FlaskConical,
  link: '/agent/research',
  category: 'Research'
}, {
  key: 'coding',
  icon: Code,
  link: '/agent/coding',
  category: 'Coding & Billing'
}, {
  key: 'administration',
  icon: FileText,
  link: '/agent/administration',
  category: 'Administrative'
}, {
  key: 'consent',
  icon: FileSignature,
  link: '/agent/consent',
  category: 'Legal & Compliance'
}, {
  key: 'summary',
  icon: FileStack,
  link: '/agent/summary',
  category: 'Documentation'
}, {
  key: 'legalReview',
  icon: Scale,
  link: '/agent/legal-review',
  category: 'Legal & Compliance'
}, {
  key: 'protocolReview',
  icon: FileSearch,
  link: '/agent/protocol-review',
  category: 'Research'
}, {
  key: 'surgicalProtocols',
  icon: ClipboardCheck,
  link: '/agent/surgical-protocols',
  category: 'Surgical'
}, {
  key: 'logbook',
  icon: BookOpen,
  link: '/agent/logbook',
  category: 'Surgical'
}, {
  key: 'billing',
  icon: Receipt,
  link: '/agent/billing',
  category: 'Coding & Billing'
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex pt-20">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="sticky top-20 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('agents.title')}</h2>
              <p className="text-sm text-muted-foreground mb-6">
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
                className="pl-9 h-9"
              />
            </div>

            {/* Category Filters */}
            <div>
              <h3 className="text-sm font-medium mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
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
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {t(`agents.categories.${category.toLowerCase().replace(/\s+/g, '_').replace('&', 'and')}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Create Your Own Agent CTA - Compact */}
            <Link to="/custom-agent" className="block mb-8">
              <Card className="hover-lift cursor-pointer bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 transition-all">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">
                      {t('agents.custom.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {t('agents.custom.desc')}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Agents Grid - Compact Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {visibleAgents.map(agent => (
                <Link key={agent.key} to={agent.link}>
                  <Card className="hover-lift cursor-pointer transition-all h-full group">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                      {agent.icon && <agent.icon className="w-12 h-12 text-primary" strokeWidth={1.5} />}
                    </div>
                    <CardHeader className="p-3 space-y-1">
                      <CardTitle className="text-xs font-semibold leading-tight line-clamp-2">
                        {t(`agents.${agent.key}.name`)}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 w-fit">
                        {t(`agents.${agent.key}.specialty`)}
                      </Badge>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Trigger */}
            {visibleCount < filteredAgents.length && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                <div className="animate-pulse text-muted-foreground">Loading more...</div>
              </div>
            )}

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
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
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Mic, Shield, Scissors, FlaskConical, Code, FileText, FileSignature, FileStack, Scale, FileSearch, ClipboardCheck, BookOpen, Heart, Eye, Receipt } from 'lucide-react';
const agents = [{
  key: 'aorta',
  icon: Heart,
  link: '/agent/aorta',
  category: 'Clinical'
}, {
  key: 'ojos',
  icon: Eye,
  link: '/agent/ojos',
  category: 'Clinical'
}, {
  key: 'clinicalDictation',
  icon: Mic,
  link: '/agent/clinical-dictation',
  category: 'Documentation'
}, {
  key: 'compliance',
  icon: Shield,
  link: '/agent/compliance',
  category: 'Legal'
}, {
  key: 'surgicalNotes',
  icon: Scissors,
  link: '/agent/surgical-notes',
  category: 'Surgery'
}, {
  key: 'research',
  icon: FlaskConical,
  link: '/agent/research',
  category: 'Research'
}, {
  key: 'coding',
  icon: Code,
  link: '/agent/coding',
  category: 'Coding'
}, {
  key: 'administration',
  icon: FileText,
  link: '/agent/administration',
  category: 'Administration'
}, {
  key: 'consent',
  icon: FileSignature,
  link: '/agent/consent',
  category: 'Legal'
}, {
  key: 'summary',
  icon: FileStack,
  link: '/agent/summary',
  category: 'Documentation'
}, {
  key: 'legalReview',
  icon: Scale,
  link: '/agent/legal-review',
  category: 'Legal'
}, {
  key: 'protocolReview',
  icon: FileSearch,
  link: '/agent/protocol-review',
  category: 'Research'
}, {
  key: 'surgicalProtocols',
  icon: ClipboardCheck,
  link: '/agent/surgical-protocols',
  category: 'Surgery'
}, {
  key: 'logbook',
  icon: BookOpen,
  link: '/agent/logbook',
  category: 'Surgery'
}, {
  key: 'billing',
  icon: Receipt,
  link: '/agent/billing',
  category: 'Billing'
}];
const categories = ['All', 'Clinical', 'Documentation', 'Surgery', 'Administration', 'Legal', 'Research', 'Coding', 'Billing'];
export default function Agents() {
  const {
    t
  } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = t(`agents.${agent.key}.name`).toLowerCase().includes(searchQuery.toLowerCase()) || t(`agents.${agent.key}.desc`).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, t]);
  return <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('agents.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('agents.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input type="text" placeholder={t('agents.search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map(category => <Badge key={category} variant={selectedCategory === category ? "default" : "outline"} className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105" onClick={() => setSelectedCategory(category)}>
                  {t(`agents.categories.${category.toLowerCase()}`)}
                </Badge>)}
            </div>
          </div>

          {/* Create Your Own Agent CTA - Reduced Size */}
          <Link to="/custom-agent" className="block mb-12">
            <Card className="hover-lift cursor-pointer bg-gradient-hero border-primary/20 transition-all overflow-hidden max-w-4xl mx-auto">
              <div className="p-8 flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {t('agents.custom.title')}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {t('agents.custom.desc')}
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => <Link key={agent.key} to={agent.link}>
                <Card className="hover-lift overflow-hidden cursor-pointer transition-all h-full">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {agent.icon && <agent.icon className="w-20 h-20 text-primary" strokeWidth={1.5} />}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{t(`agents.${agent.key}.name`)}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="text-xs">
                        {t(`agents.${agent.key}.specialty`)}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {t(`agents.${agent.key}.desc`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>)}
          </div>

          {filteredAgents.length === 0 && <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t('agents.noResults')}</p>
            </div>}
        </div>
      </main>

      <Footer />
    </div>;
}
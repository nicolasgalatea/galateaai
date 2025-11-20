import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Mic, Shield, Scissors, FlaskConical, Code, FileText, FileSignature, FileStack, Scale, FileSearch, ClipboardCheck, BookOpen } from 'lucide-react';
import agentAortaImg from '@/assets/agent-aorta.jpg';
import agentOjosImg from '@/assets/agent-ojos.jpg';
import customAgentImg from '@/assets/custom-agent.jpg';
const agents = [{
  key: 'aorta',
  image: agentAortaImg,
  link: '/agent/aorta',
  icon: null,
  category: 'Clinical'
}, {
  key: 'ojos',
  image: agentOjosImg,
  link: '/agent/ojos',
  icon: null,
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
}];
const categories = ['All', 'Clinical', 'Documentation', 'Surgery', 'Administration', 'Legal', 'Research', 'Coding'];
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

          {/* Create Your Own Agent CTA - Prominent */}
          <Link to="/custom-agent" className="block mb-12">
            <Card className="hover-lift cursor-pointer bg-gradient-hero border-primary/20 transition-all overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 aspect-square md:aspect-auto overflow-hidden">
                  <img src={customAgentImg} alt="Build your own agent" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
                <div className="md:col-span-2 p-6 flex flex-col justify-center">
                  <CardTitle className="flex items-center gap-2 text-2xl mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    {t('agents.custom.title')}
                  </CardTitle>
                  <p className="text-muted-foreground text-lg mb-4">
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
                  {agent.image ? <div className="aspect-square overflow-hidden">
                      <img src={agent.image} alt={t(`agents.${agent.key}.name`)} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div> : <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {agent.icon && <agent.icon className="w-24 h-24 text-primary" />}
                    </div>}
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
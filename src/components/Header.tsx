import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, User } from 'lucide-react';
import { AuthModal } from './AuthModal';
import galateaLogo from '@/assets/galatea-logo.png';

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src={galateaLogo} alt="Galatea AI" className="h-24 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/agents" className="text-foreground hover:text-primary transition-colors">
              {t('nav.agents')}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/team" className="text-foreground hover:text-primary transition-colors">
              Team
            </Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
              Licensing
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              {t('nav.contact')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              {language.toUpperCase()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              {t('auth.loginSignup')}
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/contact">{t('hero.cta.demo')}</Link>
            </Button>
          </div>
        </nav>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};

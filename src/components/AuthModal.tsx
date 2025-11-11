import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { t } = useLanguage();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', loginData);
    // Add your login logic here
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert(t('auth.passwordMismatch'));
      return;
    }
    console.log('Signup:', signupData);
    // Add your signup logic here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('auth.title')}</DialogTitle>
          <DialogDescription>{t('auth.description')}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('contact.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t('auth.loginButton')}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">{t('contact.email')}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">{t('auth.password')}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t('auth.signupButton')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

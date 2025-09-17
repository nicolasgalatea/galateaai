import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Stethoscope, Building2, Heart, GraduationCap, Users } from 'lucide-react';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '' as 'medico' | 'hospital' | 'eps' | 'investigador' | 'paciente' | ''
  });

  // If user is already authenticated, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (!error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!signUpData.role) {
      alert('Por favor selecciona tu rol');
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.fullName,
      signUpData.role
    );
    
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'medico', label: 'Médico/Especialista', icon: Stethoscope, description: 'Profesional de la salud individual' },
    { value: 'hospital', label: 'Hospital/Clínica', icon: Building2, description: 'Institución de salud' },
    { value: 'eps', label: 'EPS/IPS', icon: Heart, description: 'Aseguradora de salud' },
    { value: 'investigador', label: 'Investigador', icon: GraduationCap, description: 'Institución de investigación médica' },
    { value: 'paciente', label: 'Paciente', icon: Users, description: 'Usuario final del sistema' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={galateaAvatar} alt="Galatea AI" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">GA</AvatarFallback>
              </Avatar>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
            </div>
            
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Bienvenido
              </span>
            </h1>
            <p className="text-muted-foreground">
              Accede a tu cuenta o crea una nueva para comenzar con Galatea AI
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Correo electrónico</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Contraseña</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Completa la información para crear tu cuenta en Galatea AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo electrónico</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role-select">¿Cuál es tu rol?</Label>
                      <Select 
                        value={signUpData.role} 
                        onValueChange={(value) => setSignUpData(prev => ({ 
                          ...prev, 
                          role: value as 'medico' | 'hospital' | 'eps' | 'investigador' | 'paciente' 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <option.icon className="w-4 h-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, Settings, Bot, MessageSquare, ShoppingCart, BarChart3, 
  Stethoscope, Building2, Heart, GraduationCap, Users, Plus,
  TrendingUp, Clock, Star, ChevronRight
} from 'lucide-react';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'medico': return Stethoscope;
      case 'hospital': return Building2;
      case 'eps': return Heart;
      case 'investigador': return GraduationCap;
      case 'paciente': return Users;
      default: return Users;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'medico': return 'Médico/Especialista';
      case 'hospital': return 'Hospital/Clínica';
      case 'eps': return 'EPS/IPS';
      case 'investigador': return 'Investigador';
      case 'paciente': return 'Paciente';
      default: return 'Usuario';
    }
  };

  const quickActions = [
    {
      title: 'Chatear con Dr. Sofia',
      description: 'Consulta con nuestro agente cardiovascular',
      icon: MessageSquare,
      href: '/chat-sofia',
      color: 'bg-blue-500'
    },
    {
      title: 'Crear Agente AI',
      description: 'Diseña tu propio agente especializado',
      icon: Bot,
      href: '/create-agent',
      color: 'bg-green-500'
    },
    {
      title: 'Explorar Marketplace',
      description: 'Descubre agentes de la comunidad',
      icon: ShoppingCart,
      href: '/marketplace',
      color: 'bg-purple-500'
    },
    {
      title: 'Ver Análisis',
      description: 'Revisa estadísticas y métricas',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      title: 'Consulta con Dr. Sofia completada',
      description: 'Análisis cardiovascular - Paciente #12345',
      time: 'Hace 2 horas',
      type: 'consultation'
    },
    {
      title: 'Nuevo agente creado: Dr. Cardio',
      description: 'Especialista en arritmias cardíacas',
      time: 'Hace 1 día',
      type: 'creation'
    },
    {
      title: 'Agente vendido en marketplace',
      description: 'Dr. Neuro - 3 descargas nuevas',
      time: 'Hace 2 días',
      type: 'sale'
    }
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Cargando perfil...</h1>
          <p className="text-muted-foreground">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profile.user_role);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={galateaAvatar} alt="Galatea AI" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">GA</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Galatea AI
                </h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ¡Bienvenido, {profile.full_name || profile.email}!
              </h1>
              <p className="text-muted-foreground">
                Gestiona tus agentes AI y accede a todas las funcionalidades de la plataforma
              </p>
            </div>
            
            <Card className="p-6 min-w-fit">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <RoleIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{getRoleLabel(profile.user_role)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Acceder <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes Creados</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+0%</span> desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+0%</span> desde la semana pasada
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo de Uso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0h</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tus últimas interacciones con la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay actividad reciente</p>
                    <p className="text-sm">¡Comienza creando tu primer agente!</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Inicial</CardTitle>
              <CardDescription>
                Completa estos pasos para aprovechar al máximo la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                  <div className="w-6 h-6 rounded-full bg-success text-white text-sm flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm">Cuenta verificada</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center">
                    1
                  </div>
                  <span className="text-sm">Crear tu primer agente AI</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center">
                    2
                  </div>
                  <span className="text-sm">Explorar el marketplace</span>
                </div>
                
                <Button className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Comenzar con Dr. Sofia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
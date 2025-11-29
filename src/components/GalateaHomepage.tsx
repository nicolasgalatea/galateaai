import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowRight, Users, Zap, Globe, CheckCircle, Star, Play, Brain, Stethoscope, 
  Building2, GraduationCap, MessageSquare, Mic, Shield, Sparkles, Bot, FileText, 
  Search, TrendingUp, Calendar, Mail, Heart, Award, Database, Cloud, Microscope, 
  Activity, Phone, Target, Lightbulb, Code, Cpu, UserPlus, Settings, ShoppingCart,
  Upload, TestTube, Eye, Headphones, Lock, Globe2, Languages, AlertTriangle
} from 'lucide-react';

// Import hyper-realistic avatar images
import miraAvatar from '@/assets/mira-avatar.jpg';
import aydaAvatar from '@/assets/ayda-avatar.jpg';
import erinAvatar from '@/assets/erin-avatar.jpg';
import mireyaAvatar from '@/assets/mireya-avatar.jpg';
import carlosCardioAvatar from '@/assets/carlos-cardio-avatar.jpg';
import elenaOncoAvatar from '@/assets/elena-onco-avatar.jpg';
import amaraPediatricAvatar from '@/assets/amara-pediatric-avatar.jpg';
import rajOrthoAvatar from '@/assets/raj-ortho-avatar.jpg';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

export const GalateaHomepage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [showAvatar, setShowAvatar] = useState(false);

  const avatarSteps = [
    { 
      id: 1, 
      title: "Hello! I'm Dr. Sofia", 
      subtitle: "Your AI Healthcare Assistant",
      description: "I'm a hyper-realistic avatar powered by Galatea AI. I specialize in aortic diagnosis and cardiovascular complications to help you with precise medical assessments."
    },
    { 
      id: 2, 
      title: "Create Your AI Agent", 
      subtitle: "In Just 5 Minutes",
      description: "Design specialized agents for clinical care, administration, research, or patient support with our intuitive wizard."
    },
    { 
      id: 3, 
      title: "Deploy Anywhere", 
      subtitle: "Scale Globally",
      description: "Launch your agents across hospitals, clinics, or make them available in our marketplace for other healthcare professionals."
    }
  ];

  const platformSteps = [
    {
      icon: UserPlus,
      title: "Register & Define Role",
      description: "Choose your healthcare role: Physician, Hospital, EPS, Researcher, or Patient",
      color: "bg-blue-500"
    },
    {
      icon: Bot,
      title: "Create AI Agent",
      description: "Select agent type: Clinical, Administrative, Research, or Patient Support",
      color: "bg-green-500"
    },
    {
      icon: Settings,
      title: "Customize Avatar",
      description: "Design hyper-realistic appearance with voice synthesis via ElevenLabs",
      color: "bg-purple-500"
    },
    {
      icon: Upload,
      title: "Train with Data",
      description: "Upload medical protocols, research papers, and institutional guidelines",
      color: "bg-orange-500"
    },
    {
      icon: TestTube,
      title: "Test & Validate",
      description: "Interactive testing with text and voice conversations",
      color: "bg-red-500"
    },
    {
      icon: Globe2,
      title: "Deploy & Scale",
      description: "Launch globally or sell in our AI agent marketplace",
      color: "bg-teal-500"
    }
  ];

  const stakeholders = [
    { icon: Stethoscope, title: "Physicians", description: "Individual doctors and specialists" },
    { icon: Building2, title: "Hospitals", description: "Healthcare institutions and networks" },
    { icon: Heart, title: "EPS/IPS", description: "Insurance and health service providers" },
    { icon: GraduationCap, title: "Researchers", description: "Medical research institutions" },
    { icon: Users, title: "Patients", description: "Individual healthcare consumers" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={galateaAvatar} alt="Dr. Galatea - Fundadora de Galatea AI" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">GA</AvatarFallback>
              </Avatar>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Platform</a>
              <a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">AI Agents</a>
              <a href="#lab" className="text-muted-foreground hover:text-foreground transition-colors">AI Lab</a>
              <a href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</a>
              <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/chat-sofia">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Chat with Dr. Sofia
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth">Sign In</a>
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90" asChild>
                <a href="/auth">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create AI Agent
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Avatar */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-primary font-semibold tracking-wide">Sovereign Health-Ops Infrastructure</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-foreground">Infrastructure for the</span>
                <br />
                <span className="text-foreground">Healthcare</span>{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Agentic Web
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Build, Deploy, and Scale{' '}
                <span className="text-primary font-semibold">Sovereign Autonomous Agents</span>.
                <span className="block mt-2 font-medium text-foreground/80">Secure. Compliant. No-Code.</span>
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-primary hover:opacity-90" asChild>
                  <a href="/chat-sofia">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Chat with Dr. Sofia Now
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                  <a href="/creator-studio">
                    <TestTube className="w-5 h-5 mr-2" />
                    Create AI Agent
                  </a>
                </Button>
              </div>

              {/* Stakeholder Icons */}
              <div className="flex items-center space-x-8 pt-8">
                <span className="text-sm text-muted-foreground">Trusted by:</span>
                <div className="flex items-center space-x-6">
                  {stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 group">
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <stakeholder.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{stakeholder.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Avatar Demo */}
            <div className="relative">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-500">
                <div className="text-center space-y-6">
                  {/* Avatar Container */}
                  <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse" />
                    <div className="relative w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border-4 border-primary/20">
                      <Avatar className="w-48 h-48">
                        <AvatarImage src={galateaAvatar} alt="Dr. Galatea - AI Avatar" />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">GA</AvatarFallback>
                      </Avatar>
                      
                      {/* Voice Indicator */}
                      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-primary/90 text-white px-3 py-2 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <Headphones className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Introduction */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary">
                      {avatarSteps[activeStep - 1]?.title}
                    </h3>
                    <p className="text-primary/80 font-medium">
                      {avatarSteps[activeStep - 1]?.subtitle}
                    </p>
                    <p className="text-muted-foreground">
                      {avatarSteps[activeStep - 1]?.description}
                    </p>
                  </div>

                  {/* Interactive Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveStep(activeStep === 1 ? 3 : activeStep - 1)}
                    >
                      Previous
                    </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary/90 hover:bg-primary"
                    asChild
                  >
                    <a href="/chat-sofia">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Dr. Sofia
                    </a>
                  </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                    >
                      Next
                    </Button>
                  </div>

                  {/* Demo Features */}
                  <div className="flex justify-center space-x-6 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>Text Chat</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mic className="w-4 h-4 text-primary" />
                      <span>Voice AI</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Languages className="w-4 h-4 text-primary" />
                      <span>Multilingual</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* AI LAB SECTION */}
      <section id="lab" className="py-32 px-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-primary/15 px-8 py-4 rounded-full mb-8 border border-primary/20">
              <TestTube className="w-6 h-6 text-primary" />
              <span className="text-primary font-bold text-lg">Advanced AI Lab</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI laboratory
              </span>
              <br />
              <span className="text-foreground">hyperrealistic avatars</span>
            </h2>
            
            <p className="text-2xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-light mb-12">
              Create medical AI agents with photorealistic avatars in minutes. 
              Customize appearance, voice, specialization and medical knowledge.
            </p>
          </div>

          {/* Main Lab Card */}
          <div className="max-w-5xl mx-auto">
            <Card className="p-12 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Features */}
                <div className="space-y-8">
                    <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/20 rounded-full">
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Agents Hyperrealistic</h3>
                        <p className="text-muted-foreground">Create unique appearances with generative AI</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-secondary/20 rounded-full">
                        <Headphones className="w-8 h-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Voice Synthesis</h3>
                        <p className="text-muted-foreground">Natural voices with ElevenLabs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-accent/20 rounded-full">
                        <Brain className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Specialized AI</h3>
                        <p className="text-muted-foreground">Training with medical protocols</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 space-y-4">
                    <Button 
                      size="lg" 
                      className="text-xl px-12 py-6 bg-gradient-primary hover:opacity-90 w-full lg:w-auto"
                      asChild
                    >
                      <a href="/creator-studio">
                        <TestTube className="w-6 h-6 mr-3" />
                        Enter Laboratory
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </a>
                    </Button>
                    
                    <div className="lg:ml-4">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-10 py-5 border-2 border-primary/40 hover:bg-primary/5 w-full lg:w-auto"
                        asChild
                      >
                        <a href="/advanced-creator">
                          <Sparkles className="w-5 h-5 mr-3" />
                          Advanced Platform
                          <ArrowRight className="w-5 h-5 ml-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Visual Preview */}
                <div className="relative">
                  <div className="relative w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden border-2 border-primary/30">
                    {/* Single Avatar Preview */}
                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                      <div className="relative group">
                        <Avatar className="w-48 h-48 rounded-xl ring-4 ring-primary/30 group-hover:ring-primary/60 transition-all">
                          <AvatarImage src={amaraPediatricAvatar} alt="Dra. Amara" />
                          <AvatarFallback>AP</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 text-white text-sm font-bold">Dra. Amara</div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-bold">
                      4+ Especialidades
                    </div>
                    <div className="absolute bottom-4 left-4 bg-secondary/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      IA Generativa
                    </div>
                  </div>

                  {/* Floating Action Indicators */}
                  <div className="absolute -top-6 -right-6 bg-accent text-white p-4 rounded-full shadow-lg animate-bounce">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-primary text-white p-4 rounded-full shadow-lg animate-pulse">
                    <Cpu className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">5min</div>
              <p className="text-muted-foreground">Average creation time</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">100+</div>
              <p className="text-muted-foreground">Available voices</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">24/7</div>
              <p className="text-muted-foreground">Agent availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO EN VIVO - SECCIÓN PRINCIPAL */}
      <section id="demo-video" className="py-32 px-6 bg-gradient-to-br from-red-500/10 via-primary/5 to-secondary/10 relative overflow-hidden border-y-4 border-primary/20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/90" />
        
        {/* Floating Alert Badge */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-red-500/20 text-red-600 px-6 py-3 rounded-full border-2 border-red-500/30 animate-bounce">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-lg">Live Demo Available</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-primary/15 px-8 py-4 rounded-full mb-8 border border-primary/20">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-primary font-bold text-lg">Live Demo</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
              <br />
              <span className="text-foreground">In real action</span>
            </h2>
            
            <p className="text-2xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-light">
              See how our cardiovascular agent analyzes a complex case in real time, 
              from study interpretation to precise clinical recommendations.
            </p>
          </div>

          {/* Video Demo Container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Browser Window Frame */}
            <div className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded">
                    galatea.ai/demo-cardiovascular
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live Streaming
                  </Badge>
                </div>
              </div>
              
              {/* Video Content Area */}
              <div className="relative bg-gradient-to-br from-background/50 to-muted/30 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Main Video Demo Interface */}
                  <div className="w-full max-w-4xl p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Left: Avatar & Analysis */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="relative">
                            <Avatar className="w-20 h-20 ring-4 ring-primary/30">
                              <AvatarImage src={galateaAvatar} alt="Dr. Cardiovascular AI" />
                              <AvatarFallback className="bg-primary text-white text-2xl">DC</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-primary">Dr. Cardiovascular AI</h3>
                            <p className="text-muted-foreground">Aortic Pathology Specialist</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-600 font-medium">Analyzing in real time...</span>
                            </div>
                          </div>
                        </div>
                        
                        <Card className="p-6 bg-primary/10 border-primary/30">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Stethoscope className="w-5 h-5 text-primary" />
                              <span className="font-semibold text-primary">Diagnostic Analysis:</span>
                            </div>
                            <div className="text-foreground">
                              <p className="font-medium mb-2">
                                "I have identified an <span className="text-red-600 font-bold">ascending aortic aneurysm of 5.2 cm</span>."
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Recommendation: Follow-up every 6 months. Surgical evaluation if it exceeds 5.5 cm.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      {/* Right: Metrics & Data */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-red-50/50 border-red-200/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-red-700">Critical Finding</span>
                              </div>
                              <p className="text-2xl font-bold text-red-600">5.2 cm</p>
                              <p className="text-xs text-red-500">Aortic diameter</p>
                            </Card>
                          
                          <Card className="p-4 bg-blue-50/50 border-blue-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-bold text-blue-700">Precision</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">97.8%</p>
                            <p className="text-xs text-blue-500">Diagnostic confidence</p>
                          </Card>
                          
                          <Card className="p-4 bg-green-50/50 border-green-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-bold text-green-700">Speed</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">2.3s</p>
                            <p className="text-xs text-green-500">Analysis time</p>
                          </Card>
                          
                          <Card className="p-4 bg-purple-50/50 border-purple-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <Brain className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-bold text-purple-700">Advanced AI</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">GPT-4</p>
                            <p className="text-xs text-purple-500">Medical model</p>
                          </Card>
                        </div>
                      </div>
                    </div>
                    
                    {/* Demo Progress Bar */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Demo Progress</span>
                        <span className="text-sm font-bold text-primary">67%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <Button size="lg" className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
                    <Play className="w-8 h-8 mr-3" />
                    Watch Full Demo
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Demo Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
              <Button size="lg" className="text-xl px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-lg">
                <Play className="w-6 h-6 mr-3" />
                Start Interactive Demo
              </Button>
              <Button variant="outline" size="lg" className="text-xl px-10 py-6 border-2 border-primary/30 hover:border-primary/50">
                <Eye className="w-6 h-6 mr-3" />
                View More Clinical Cases
              </Button>
            </div>
            
            {/* Demo Features */}
            <div className="grid md:grid-cols-4 gap-6 mt-16">
              {[
                { icon: Upload, title: "File Upload", description: "PDFs, DICOM images, clinical histories" },
                { icon: Brain, title: "AI Analysis", description: "Real-time processing with medical GPT-4" },
                { icon: Stethoscope, title: "Diagnosis", description: "Precise clinical recommendations" },
                { icon: FileText, title: "Final Report", description: "Complete and detailed documentation" }
              ].map((feature, index) => (
                <Card key={index} className="p-6 text-center bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Video Demo Section */}
      <section id="demo-detailed" className="py-32 px-6 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full mb-6">
              <Play className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-primary font-semibold">Detailed Professional Demo</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Complete experience
              </span>
              <br />
              <span className="text-foreground">Galatea AI in action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Watch how a specialized cardiovascular agent analyzes a real case in real time, 
              from file upload to final diagnosis with precise clinical recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Demo Video Interface */}
            <div className="relative">
              <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Live Demo
                    </Badge>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 min-h-[400px]">
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                        <AvatarImage src={galateaAvatar} alt="Dr. Cardio AI" />
                        <AvatarFallback>DC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xl font-semibold text-primary">Dr. Cardio AI</h4>
                        <p className="text-muted-foreground">Aorta Specialist</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2 bg-green-500/20 text-green-600 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Online</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-medium text-primary mb-2">Dr. Cardio AI says:</p>
                        <p className="text-foreground">
                          "I have identified an <strong>ascending aortic aneurysm of 5.2 cm</strong>. 
                          Follow-up imaging is recommended every 6 months and surgical evaluation 
                          if it exceeds 5.5 cm."
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 bg-red-50/50 border-red-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-semibold text-red-700">Critical Finding</span>
                            </div>
                            <p className="text-sm text-red-600">Diameter: 5.2 cm</p>
                          </Card>
                        
                        <Card className="p-4 bg-blue-50/50 border-blue-200/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-700">Precision</span>
                          </div>
                          <p className="text-sm text-blue-600">97.3% confidence</p>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Full Demo
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-primary/20 backdrop-blur-sm p-4 rounded-xl border border-primary/30">
                <div className="flex items-center space-x-2 text-primary">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-semibold">AI Processing</span>
                </div>
              </div>
            </div>

            {/* Right Side - Key Features */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">
                  Advanced demo capabilities
                </h3>
                <p className="text-lg text-muted-foreground">
                  Each agent is equipped with cutting-edge technology to deliver 
                  precise diagnoses and reliable clinical recommendations.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="p-6 border-l-4 border-green-500 hover:shadow-glow transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Microscope className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Medical image analysis</h4>
                      <p className="text-muted-foreground">
                        Advanced processing of echocardiograms, CT scans and MRIs 
                        with validated clinical precision.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-l-4 border-blue-500 hover:shadow-glow transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Differential diagnosis</h4>
                      <p className="text-muted-foreground">
                        Systematic evaluation of multiple diagnostic possibilities 
                        based on updated medical evidence.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-l-4 border-purple-500 hover:shadow-glow transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Personalized follow-up</h4>
                      <p className="text-muted-foreground">
                        Follow-up recommendations adapted to the specific profile 
                        of each patient and their clinical condition.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="pt-6">
                <Button variant="outline" size="lg" className="w-full">
                  <Code className="w-5 h-5 mr-2" />
                  Explore All Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Types Section */}
      <section id="agents" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Agent Types</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Specialized AI agents for every healthcare need
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Choose from our pre-configured agent types or create custom solutions tailored to your specific requirements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-blue-500/10 rounded-xl w-fit mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Clinical Agents</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Specialized in patient care, diagnosis support, and treatment recommendations
              </p>
              <Badge className="bg-blue-500/10 text-blue-600">Most Popular</Badge>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Administrative</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Automate scheduling, billing, authorizations, and administrative workflows
              </p>
              <Badge className="bg-green-500/10 text-green-600">Available Now</Badge>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-purple-500/10 rounded-xl w-fit mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Research Agents</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Literature review, data analysis, and research protocol assistance
              </p>
              <Badge className="bg-purple-500/10 text-purple-600">Beta</Badge>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-orange-500/10 rounded-xl w-fit mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Patient Support</h3>
              <p className="text-muted-foreground text-sm mb-4">
                24/7 patient education, medication reminders, and health monitoring
              </p>
              <Badge className="bg-orange-500/10 text-orange-600">Coming Soon</Badge>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-teal-500/10 rounded-xl w-fit mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Educational Agents</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Specialized support for universities, institutions, students, professors, and healthcare personnel training
              </p>
              <Badge className="bg-teal-500/10 text-teal-600">Most Requested</Badge>
            </Card>
            
          </div>
        </div>
      </section>


      {/* Hyper-Realistic AI Agents Section */}
      <section className="py-20 px-6 bg-muted/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Meet Our AI Agents</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Hyper-realistic healthcare avatars
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Experience natural conversations with AI agents that look, sound, and act like real healthcare professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Dr. Carlos - Cardiovascular Assistant */}
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-2">
                  <Avatar className="w-56 h-56 border-6 border-white shadow-2xl">
                    <AvatarImage src={carlosCardioAvatar} alt="Dr. Carlos - Cardiovascular Specialist" className="object-cover" />
                    <AvatarFallback className="bg-red-500 text-white text-4xl font-bold">CA</AvatarFallback>
                  </Avatar>
                </div>
                <Badge className="absolute top-4 right-4 bg-red-500 text-white">Specialist</Badge>
                <Badge className="absolute top-4 left-4 bg-primary/90 text-white">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Dr. Carlos</h3>
                <p className="text-red-600 font-medium mb-4">Cardiovascular Care Assistant</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Specialized in cardiac monitoring, hypertension management, post-cardiac surgery care, 
                  and cardiovascular risk assessment protocols.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Cardiology</Badge>
                  <Badge variant="outline" className="text-xs">ICU Care</Badge>
                  <Badge variant="outline" className="text-xs">Heart Surgery</Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-red-500/10">GA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Created by:</p>
                    <p className="text-primary">Galatea AI Medical Team</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Elena - Oncology Specialist */}
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-2">
                  <Avatar className="w-56 h-56 border-6 border-white shadow-2xl">
                    <AvatarImage src={elenaOncoAvatar} alt="Dr. Elena - Oncology Specialist" className="object-cover" />
                    <AvatarFallback className="bg-purple-500 text-white text-4xl font-bold">EL</AvatarFallback>
                  </Avatar>
                </div>
                <Badge className="absolute top-4 right-4 bg-purple-500 text-white">Expert</Badge>
                <Badge className="absolute top-4 left-4 bg-primary/90 text-white">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Dr. Elena</h3>
                <p className="text-purple-600 font-medium mb-4">Oncology Treatment Assistant</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Expert in chemotherapy protocols, radiation therapy support, cancer patient education, 
                  and palliative care coordination.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Oncology</Badge>
                  <Badge variant="outline" className="text-xs">Chemotherapy</Badge>
                  <Badge variant="outline" className="text-xs">Patient Support</Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-purple-500/10">GA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Created by:</p>
                    <p className="text-primary">Galatea AI Medical Team</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Amara - Pediatric Specialist */}
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2">
                  <Avatar className="w-56 h-56 border-6 border-white shadow-2xl">
                    <AvatarImage src={amaraPediatricAvatar} alt="Dr. Amara - Pediatric Specialist" className="object-cover" />
                    <AvatarFallback className="bg-green-500 text-white text-4xl font-bold">AM</AvatarFallback>
                  </Avatar>
                </div>
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">Pediatric</Badge>
                <Badge className="absolute top-4 left-4 bg-primary/90 text-white">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Dr. Amara</h3>
                <p className="text-green-600 font-medium mb-4">Pediatric Care Assistant</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Specialized in child development tracking, vaccination schedules, pediatric emergencies, 
                  and family education for childhood illnesses.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Pediatrics</Badge>
                  <Badge variant="outline" className="text-xs">Child Development</Badge>
                  <Badge variant="outline" className="text-xs">Family Care</Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-green-500/10">GA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Created by:</p>
                    <p className="text-primary">Galatea AI Medical Team</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Raj - Orthopedic Surgeon */}
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-2">
                  <Avatar className="w-56 h-56 border-6 border-white shadow-2xl">
                    <AvatarImage src={rajOrthoAvatar} alt="Dr. Raj - Orthopedic Surgeon" className="object-cover" />
                    <AvatarFallback className="bg-blue-500 text-white text-4xl font-bold">RA</AvatarFallback>
                  </Avatar>
                </div>
                <Badge className="absolute top-4 right-4 bg-blue-500 text-white">Surgeon</Badge>
                <Badge className="absolute top-4 left-4 bg-primary/90 text-white">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Dr. Raj</h3>
                <p className="text-blue-600 font-medium mb-4">Orthopedic Surgery Assistant</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Expert in joint replacement protocols, fracture management, sports medicine, 
                  and post-operative rehabilitation planning.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Orthopedics</Badge>
                  <Badge variant="outline" className="text-xs">Joint Surgery</Badge>
                  <Badge variant="outline" className="text-xs">Sports Medicine</Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-blue-500/10">GA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Created by:</p>
                    <p className="text-primary">Galatea AI Medical Team</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Demo Section */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-4">Experience natural conversations</h3>
                  <p className="text-muted-foreground mb-6">
                    Our hyper-realistic avatars use advanced AI to provide natural, empathetic interactions. 
                    Each agent is specialized for specific medical scenarios and can communicate through text and voice.
                  </p>
                  <div className="flex space-x-4">
                    <Button asChild className="bg-gradient-primary hover:opacity-90">
                      <a href="/demo">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Complete Demo
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/demo">
                        <Mic className="w-4 h-4 mr-2" />
                        Interactive Demo
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src="/api/placeholder/150/150" alt="Demo Avatar" />
                      <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">AI</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Success Stories</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Leading institutions trust Galatea AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Discover how we help hospitals and health organizations build, 
              deploy and commercialize their own AI agent ecosystems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Hospital San Ignacio */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  HSI
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Hospital San Ignacio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pontificia Javeriana University
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">15 Agentes Especializados</p>
                      <p className="text-xs text-muted-foreground">Cardiology, Oncology, Neurology</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">40% Time Reduction</p>
                      <p className="text-xs text-muted-foreground">In administrative consultations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Active Marketplace</p>
                      <p className="text-xs text-muted-foreground">Licensing agents to 50+ hospitals</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* EPS Sura */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  SURA
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">EPS SURA</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Empresa Promotora de Salud
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Network of 200+ Agents</p>
                      <p className="text-xs text-muted-foreground">Authorizations and administrative management</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">2M+ Benefited Members</p>
                      <p className="text-xs text-muted-foreground">24/7 automated attention</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Innovation Leader</p>
                      <p className="text-xs text-muted-foreground">National Digital Health Award 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instituto Nacional de Cancerología */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  INC
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Instituto Nacional</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    de Cancerología - Colombia
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Oncology Agents</p>
                      <p className="text-xs text-muted-foreground">Specialized by cancer type</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Advanced Research</p>
                      <p className="text-xs text-muted-foreground">Scientific literature analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ShoppingCart className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Global Commercialization</p>
                      <p className="text-xs text-muted-foreground">Licensed agents in 15 countries</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cardiovascular Foundation */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  FCV
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-500 mb-2">Cardiovascular Foundation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bucaramanga - Santander
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Dr. Carlos AI</p>
                      <p className="text-xs text-muted-foreground">Star cardiological agent</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">10,000+ Evaluations</p>
                      <p className="text-xs text-muted-foreground">Automated cardiovascular risk</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Rapid Expansion</p>
                      <p className="text-xs text-muted-foreground">Adopted by 30+ regional clinics</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hospital Pablo Tobón Uribe */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  HPTU
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-600 mb-2">Hospital Pablo Tobón</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Medellín - Antioquia
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Hub de Agentes AI</p>
                      <p className="font-medium text-sm">25 medical specialties</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">95% Satisfaction</p>
                      <p className="text-xs text-muted-foreground">Patients and medical staff</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Replicable Model</p>
                      <p className="text-xs text-muted-foreground">Licensed to similar hospitals</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* CES University */}
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  CES
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-600 mb-2">CES University</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Facultad de Medicina
                  </p>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Agentes Educativos</p>
                      <p className="text-xs text-muted-foreground">Simulación clínica avanzada</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">5,000+ Estudiantes</p>
                      <p className="text-xs text-muted-foreground">Entrenamiento con casos reales</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Centro de Innovación</p>
                      <p className="text-xs text-muted-foreground">Desarrollo de nuevos agentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">
                Ready to create your AI agent ecosystem?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join the leading institutions that are already transforming healthcare 
                with Galatea AI. Build, deploy and monetize your own specialized agents.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                <Bot className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/demo">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Interactive Demo
                </a>
              </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Agent Marketplace</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Explore & license ready-made AI agents
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Discover specialized agents created by healthcare professionals worldwide, 
              or monetize your own creations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Featured Agent Cards */}
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/api/placeholder/48/48" alt="Dr. Martinez" />
                    <AvatarFallback>DM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Cardiology Specialist</h3>
                    <p className="text-sm text-muted-foreground">by Dr. Martinez</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Advanced ECG interpretation and cardiovascular risk assessment with real-time monitoring
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500/10 text-green-600">Licensed 450+</Badge>
                <span className="font-semibold">$299/month</span>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/api/placeholder/48/48" alt="Hospital Central" />
                    <AvatarFallback>HC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">EPS Administrative</h3>
                    <p className="text-sm text-muted-foreground">by Hospital Central</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Complete administrative automation for EPS workflows, authorizations, and billing
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/10 text-blue-600">Licensed 120+</Badge>
                <span className="font-semibold">$199/month</span>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/api/placeholder/48/48" alt="Research Institute" />
                    <AvatarFallback>RI</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Oncology Research</h3>
                    <p className="text-sm text-muted-foreground">by Research Institute</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">5.0</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Specialized in cancer research protocols, literature analysis, and treatment optimization
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/10 text-purple-600">Licensed 80+</Badge>
                <span className="font-semibold">$399/month</span>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="mr-4">
              <Search className="w-5 h-5 mr-2" />
              Browse All Agents
            </Button>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Sell Your Agents
            </Button>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Security & Compliance</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Enterprise-grade security for healthcare
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Built from the ground up with healthcare compliance in mind. Your data and patients' privacy are our top priority.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-muted-foreground text-sm">
                Full compliance with US healthcare privacy regulations
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-muted-foreground text-sm">
                All data encrypted in transit and at rest
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GDPR Ready</h3>
              <p className="text-muted-foreground text-sm">
                European data protection compliance built-in
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <TestTube className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sandbox Mode</h3>
              <p className="text-muted-foreground text-sm">
                Test with synthetic data before production deployment
              </p>
            </Card>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Trusted by healthcare leaders</h3>
              <p className="text-muted-foreground mb-6">
                Our platform meets the highest standards for medical data security and regulatory compliance, 
                trusted by hospitals and healthcare systems across Latin America.
              </p>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Security Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing Plans</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your healthcare practice. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Starter Plan */}
            <Card className="relative border-2 border-border hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">Perfect for individual practitioners</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>1 AI Agent</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>1,000 monthly conversations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Basic avatar customization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Email support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>HIPAA compliant</span>
                  </li>
                </ul>
              </CardContent>
              <CardContent className="pt-0">
                <Button className="w-full" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative border-2 border-primary scale-105 shadow-glow">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">For growing medical practices</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>5 AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>10,000 monthly conversations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced avatar features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Multi-agent coordination</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>EHR integrations</span>
                  </li>
                </ul>
              </CardContent>
              <CardContent className="pt-0">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative border-2 border-border hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-muted-foreground mt-2">For hospitals and large organizations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Unlimited AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Unlimited conversations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Custom avatar development</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>On-premise deployment</span>
                  </li>
                </ul>
              </CardContent>
              <CardContent className="pt-0">
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="bg-muted/30 rounded-2xl p-8 mb-8">
              <p className="text-muted-foreground mb-6">
                All plans include 14-day free trial • No setup fees • Cancel anytime
              </p>
              <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-green-500 mr-2" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-green-500 mr-2" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Need a custom solution?</h3>
              <p className="text-muted-foreground">
                Contact our team to discuss enterprise pricing and custom integrations
              </p>
              <Button size="lg" variant="outline">
                <Mail className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">
              Ready to transform healthcare with AI?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of healthcare professionals already using Galatea AI to create, 
              deploy, and scale hyperrealistic AI agents across their organizations.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <Bot className="w-5 h-5 mr-2" />
                Create Your First Agent Free
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                <a href="/demo">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ver Demo Interactivo
                </a>
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-12 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">5 min</div>
                <div className="text-white/70">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-white/70">AI Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-white/70">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-primary" />
                <div className="flex items-center space-x-3 justify-center">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={galateaAvatar} alt="Dr. Galatea - Fundadora de Galatea AI" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">GA</AvatarFallback>
                  </Avatar>
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    GALATEA AI
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground">
                The infrastructure for creating and coordinating medical AI agents with hyperrealistic avatars.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Create Agents</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">For Hospitals</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">For EPS/IPS</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">For Physicians</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">For Researchers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Galatea AI. All rights reserved. Empowering healthcare with hyperrealistic AI agents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
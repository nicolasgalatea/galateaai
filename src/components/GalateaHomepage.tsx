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
  Upload, TestTube, Eye, Headphones, Lock, Globe2, Languages
} from 'lucide-react';

export const GalateaHomepage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [showAvatar, setShowAvatar] = useState(false);

  const avatarSteps = [
    { 
      id: 1, 
      title: "Hello! I'm Dr. Sofia", 
      subtitle: "Your AI Healthcare Assistant",
      description: "I'm a hyper-realistic avatar powered by Galatea AI. I can help you create, manage, and deploy healthcare AI agents across your organization."
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
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GALATEA AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Platform</a>
              <a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">AI Agents</a>
              <a href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</a>
              <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Create AI Agent
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
              <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">The Infrastructure for Medical AI Agents</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Create & Deploy
                </span>
                <br />
                <span className="text-foreground">Hyperrealistic</span>
                <br />
                <span className="text-foreground">Healthcare Avatars</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                The platform that empowers every healthcare stakeholder to design, coordinate, 
                deploy, and commercialize AI-powered hyperrealistic avatars. From pharmaceutical 
                companies to individual patients.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-primary hover:opacity-90">
                  <Play className="w-5 h-5 mr-2" />
                  Create My First Agent
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Eye className="w-5 h-5 mr-2" />
                  Explore Marketplace
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
                        <AvatarImage src="/api/placeholder/192/192" alt="Dr. Sofia - AI Avatar" />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">DS</AvatarFallback>
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
                      onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Dr. Sofia
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

      {/* Platform Steps Section */}
      <section id="platform" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Create Your Healthcare AI Agent in 6 Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our intuitive platform guides you through the entire process, from concept to deployment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformSteps.map((step, index) => (
              <Card key={index} className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl text-white ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <Bot className="w-5 h-5 mr-2" />
              Start Creating Your Agent
            </Button>
          </div>
        </div>
      </section>

      {/* AI Agent Types Section */}
      <section id="agents" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Agent Types</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Specialized AI Agents for Every Healthcare Need
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
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Agent Marketplace</Badge>
            <h2 className="text-4xl font-bold mb-6">
              Explore & License Ready-Made AI Agents
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
              Enterprise-Grade Security for Healthcare
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
              <h3 className="text-2xl font-bold mb-4">Trusted by Healthcare Leaders</h3>
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

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">
              Ready to Transform Healthcare with AI?
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
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Demo with Dr. Sofia
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
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  GALATEA AI
                </span>
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
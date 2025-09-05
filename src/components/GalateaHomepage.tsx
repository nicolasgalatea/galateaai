import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Heart, Award, FileText, TrendingUp, Zap, Users, MapPin, 
  ArrowRight, CheckCircle, Brain, Shield, Stethoscope, Database,
  Cloud, Microscope, Activity, Calendar, Mail, Phone, Globe,
  Target, Lightbulb, Code, Cpu, Building2, Star, Play
} from 'lucide-react';

export const GalateaHomepage = () => {
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
              <a href="#inicio" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
              <a href="#servicios" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#tecnologia" className="text-muted-foreground hover:text-foreground transition-colors">Technology</a>
              <a href="#casos" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
              <a href="#empresa" className="text-muted-foreground hover:text-foreground transition-colors">Company</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <a href="/waitlist">Waiting List</a>
              </Button>
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">The Platform for Hyperrealistic Healthcare Avatars</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold max-w-5xl mx-auto">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
              <br />
              <span className="text-foreground">Healthcare Revolution</span>
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              The platform that empowers every healthcare stakeholder to design, deploy, and commercialize AI-powered hyperrealistic avatars. B2B and B2C solutions for institutions and individuals.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <Button size="lg" className="text-lg px-8 py-4">
                <a href="/waitlist" className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Live Demo
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <FileText className="w-5 h-5 mr-2" />
                Download Whitepaper
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-12 pt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">98%</div>
                <div className="text-muted-foreground">Patient Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">40%</div>
                <div className="text-muted-foreground">Consultation Time Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="text-muted-foreground">Availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Galatea?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">End-to-end Platform</h3>
              <p className="text-muted-foreground">
                Build, train, and launch avatars from a single hub with comprehensive tools and workflows.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Hyperrealism + Trust</h3>
              <p className="text-muted-foreground">
                Avatars that look, sound, and behave like real humans, validated for medical use.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Healthcare-Native</h3>
              <p className="text-muted-foreground">
                Designed specifically for the needs of life sciences and medical workflows.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Scalable and Global</h3>
              <p className="text-muted-foreground">
                Deploy across geographies, languages, and specialties with ease.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="empresa" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="secondary" className="mb-4">Who We Are</Badge>
                <h2 className="text-5xl font-bold mb-6">
                  The Platform for Hyperrealistic Healthcare Avatars
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We empower healthcare stakeholders to create and deploy AI-powered hyperrealistic avatars. Serving everyone from pharmaceutical companies and hospitals to medical professionals and patients.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Mission</h3>
                    <p className="text-muted-foreground">
                      Democratize access to advanced medical AI for all healthcare institutions in LATAM.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Vision</h3>
                    <p className="text-muted-foreground">
                      Be the leading medical AI platform transforming healthcare in Latin America.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Target Hospitals</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">15M+</div>
                <div className="text-muted-foreground">Patients Impacted</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <div className="text-muted-foreground">LATAM Countries</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Customer Satisfaction</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Our Services</Badge>
            <h2 className="text-5xl font-bold mb-6">
              AI Agents Specialized by Medical Area
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Each agent is trained with specific medical knowledge, clinical protocols, 
              and local regulations to provide expert assistance 24/7.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Cardiology</h3>
                  <Badge variant="outline" className="mt-1">In Development</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Advanced analysis of ECG, echocardiograms and hemodynamic studies with automatic 
                interpretation and therapeutic recommendations.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Real-time ECG interpretation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Cardiovascular risk analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Emergency protocols</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Microscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Oncology</h3>
                  <Badge variant="outline" className="mt-1">In Development</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Specialized assistant in oncological treatment plans, patient monitoring 
                and multidisciplinary coordination.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Personalized treatment plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Adverse effects monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Medical board coordination</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Administration</h3>
                  <Badge className="mt-1 bg-success/10 text-success">Available</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Intelligent automation of administrative processes, appointment management, 
                authorizations and medical billing.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic appointment management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Authorization processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Resource optimization</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Radiology</h3>
                  <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Advanced medical image analysis with automatic anomaly detection 
                and structured report generation.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic lesion detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Structured DICOM reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Prioritization by urgency</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Research</h3>
                  <Badge variant="outline" className="mt-1">Beta</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Clinical trial optimization, research protocol management 
                and complex medical data analysis.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Clinical trial management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Advanced statistical analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Regulatory compliance</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">General Medicine</h3>
                  <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Assistant for general consultation, intelligent triage and support in clinical 
                decisions for primary care.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic patient triage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Differential diagnosis support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Referral recommendations</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="tecnologia" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Advanced Technology</Badge>
            <h2 className="text-5xl font-bold mb-6">
              World-Class AI Infrastructure
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Our platform combines the latest advances in AI, natural language processing 
              and cloud computing to deliver precision medical solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Cpu className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Large Language Models</h3>
              <p className="text-muted-foreground text-sm">
                Specialized models trained with medical literature and clinical protocols
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cloud Native</h3>
              <p className="text-muted-foreground text-sm">
                Scalable and secure cloud architecture with 99.9% availability
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Medical Security</h3>
              <p className="text-muted-foreground text-sm">
                HIPAA, GDPR compliance and local data protection regulations
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Database className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">HIS Integration</h3>
              <p className="text-muted-foreground text-sm">
                Native connectivity with hospital systems and medical databases
              </p>
            </Card>
          </div>
          
          <div className="bg-card rounded-3xl p-12 shadow-glow">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">Technology Differentiators</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Specialized Medical Knowledge</h4>
                      <p className="text-muted-foreground text-sm">
                        Specific training with clinical guidelines, hospital protocols and 
                        medical literature in Spanish and Portuguese.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Continuous Learning</h4>
                      <p className="text-muted-foreground text-sm">
                        Agents constantly improve with each interaction, adapting 
                        to the particularities of each institution.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Privacy by Design</h4>
                      <p className="text-muted-foreground text-sm">
                        Local processing of sensitive data with end-to-end encryption 
                        and automatic anonymization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-primary rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-6">Performance Metrics</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">95%</div>
                    <div className="text-white/80 text-sm">Diagnostic Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">&lt;2s</div>
                    <div className="text-white/80 text-sm">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">99.9%</div>
                    <div className="text-white/80 text-sm">Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-white/80 text-sm">Active Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="casos" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Use Cases</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Transforming Medical Care in Real Time
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Our AI agents are revolutionizing medical practice in leading hospitals 
              and health centers across Latin America.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Hospital Universitario San Ignacio</h3>
                <Badge variant="outline" className="mb-4">Case Study</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Implementation of the Administrative Agent to optimize appointment management 
                and reduce waiting times by 60%.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Waiting time reduction</span>
                  <span className="font-semibold text-primary">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Administrative efficiency</span>
                  <span className="font-semibold text-primary">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient satisfaction</span>
                  <span className="font-semibold text-primary">85%</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Clínica Cardiovascular Santa María</h3>
                <Badge variant="outline" className="mb-4">Active Pilot</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Cardiology Agent assisting in ECG interpretation and cardiovascular risk analysis 
                with 95% accuracy.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Diagnostic accuracy</span>
                  <span className="font-semibold text-primary">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ECG analysis time</span>
                  <span className="font-semibold text-primary">-80%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Early detection</span>
                  <span className="font-semibold text-primary">92%</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Microscope className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Instituto Nacional de Cancerología</h3>
                <Badge variant="outline" className="mb-4">In Implementation</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Oncology Agent coordinating multidisciplinary treatment plans 
                and optimizing chemotherapy protocols.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Treatment coordination</span>
                  <span className="font-semibold text-primary">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protocol adherence</span>
                  <span className="font-semibold text-primary">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient monitoring</span>
                  <span className="font-semibold text-primary">24/7</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform Your Medical Institution?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join the leading hospitals that are already revolutionizing medical care 
            with our specialized AI agents.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4">
              <a href="/waitlist" className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Personalized Demo
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
              <a href="/waitlist" className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Join Waiting List
              </a>
            </Button>
          </div>
          
          <div className="mt-12 text-center opacity-80">
            <p className="text-sm">
              Free implementation for the first 10 institutions • 
              24/7 dedicated support • ROI guaranteed in 6 months
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  GALATEA AI
                </span>
              </div>
              <p className="text-muted-foreground">
                Revolutionizing medicine in LATAM with specialized artificial intelligence 
                agents for hospitals and medical centers.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="icon">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#servicios" className="hover:text-foreground transition-colors">AI Agents</a></li>
                <li><a href="#tecnologia" className="hover:text-foreground transition-colors">Platform</a></li>
                <li><a href="#casos" className="hover:text-foreground transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API & Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#empresa" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">News</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Investors</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@galatea.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+57 (1) 234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Bogotá, Colombia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 Galatea AI. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Security</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.agents': 'Agents',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'We build safe and intelligent agents for the healthcare sector',
    'hero.subtitle': 'Galatea AI empowers professionals, institutions, and patients through personalized AI agents for clinical, administrative, and research tasks.',
    'hero.cta.create': 'Create your AI agent',
    'hero.cta.demo': 'Request a demo',
    
    // Process Steps
    'process.title': 'How It Works',
    'process.step1.title': 'Register & Define Your Role',
    'process.step1.desc': 'Doctor, Hospital, HMO, Researcher, or Patient',
    'process.step2.title': 'Create an AI Agent',
    'process.step2.desc': 'Clinical, Administrative, Research, or Patient Support',
    'process.step3.title': 'Customize Avatar',
    'process.step3.desc': 'Hyper-realistic appearance with synthetic voice',
    'process.step4.title': 'Train with Data',
    'process.step4.desc': 'Upload medical protocols, research papers, and guidelines',
    'process.step5.title': 'Test & Validate',
    'process.step5.desc': 'Interactive text and voice testing',
    'process.step6.title': 'Deploy & Scale',
    'process.step6.desc': 'Launch globally or sell in our AI marketplace',
    'process.cta': 'Start building your agent today',
    
    // Agents
    'agents.title': 'Our AI Agents',
    'agents.aorta.name': 'Agent Aorta',
    'agents.aorta.specialty': 'Cardiology',
    'agents.aorta.desc': 'Supports cardiovascular research and diagnosis, especially in aortic pathologies.',
    'agents.ojos.name': 'Agent Ojos',
    'agents.ojos.specialty': 'Ophthalmology',
    'agents.ojos.desc': 'Assists in ophthalmologic research, image interpretation, and patient support.',
    'agents.coming': 'Coming Soon',
    
    // About
    'about.title': 'About Galatea AI',
    'about.mission.title': 'Our Mission',
    'about.mission.desc': 'Enable ethical, secure, and human-centered artificial intelligence to transform healthcare.',
    'about.vision.title': 'Our Vision',
    'about.vision.desc': 'Become the leading platform for creating and sharing medical AI agents.',
    'about.team.title': 'Founding Team',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.success': 'Message sent successfully!',
    'contact.error': 'Failed to send message. Please try again.',
    'contact.email.label': 'Email us directly at:',
    
    // Footer
    'footer.tagline': 'Safe and intelligent AI agents for healthcare',
    'footer.social': 'Follow Us',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.rights': '© 2024 Galatea AI. All rights reserved.',

    // Auth
    'auth.title': 'Welcome to Galatea AI',
    'auth.description': 'Sign in to your account or create a new one',
    'auth.login': 'Log In',
    'auth.signup': 'Sign Up',
    'auth.loginSignup': 'Sign Up / Log In',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.emailPlaceholder': 'your@email.com',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.loginButton': 'Log In',
    'auth.signupButton': 'Create Account',
    'auth.passwordMismatch': 'Passwords do not match',

    // Agent Pages
    'agent.upload.title': 'Upload Medical Data',
    'agent.upload.placeholder': 'Enter patient data, symptoms, test results, or paste medical records here...',
    'agent.upload.file': 'Upload File',
    'agent.analyze': 'Analyze Data',
    'agent.analyzing': 'Analyzing...',
    'agent.results.title': 'Analysis Results',
    'agent.results.diagnosis': 'Predicted Diagnosis',
    'agent.results.confidence': 'Confidence Level',
    'agent.results.recommendations': 'Recommended Next Steps',

    // Custom Agent
    'agents.custom.title': 'Build Your Own Agent',
    'agents.custom.desc': 'Design specialized AI agents for your healthcare needs.',
    'customAgent.title': 'Build Your Own AI Agent',
    'customAgent.subtitle': 'Create custom AI agents tailored to your specific healthcare specialty and needs',
    'customAgent.howItWorks': 'How It Works',
    'customAgent.step1.title': 'Define Your Specialty',
    'customAgent.step1.desc': 'Choose your medical specialty and define what your agent will do',
    'customAgent.step2.title': 'Configure Capabilities',
    'customAgent.step2.desc': 'Select AI capabilities like diagnosis support, research assistance, or patient interaction',
    'customAgent.step3.title': 'Train Your Agent',
    'customAgent.step3.desc': 'Upload protocols, guidelines, and domain-specific medical literature',
    'customAgent.step4.title': 'Deploy & Iterate',
    'customAgent.step4.desc': 'Test, validate, and continuously improve your agent with real-world feedback',
    'customAgent.cta.title': 'Ready to Build Your Agent?',
    'customAgent.cta.desc': 'Contact us to start creating your custom AI agent today',
    'customAgent.cta.button': 'Get Started',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.agents': 'Agentes',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    
    // Hero
    'hero.title': 'Construimos agentes seguros e inteligentes para el sector de la salud',
    'hero.subtitle': 'Galatea AI empodera a profesionales, instituciones y pacientes a través de agentes de IA personalizados para tareas clínicas, administrativas y de investigación.',
    'hero.cta.create': 'Crea tu agente de IA',
    'hero.cta.demo': 'Solicita una demo',
    
    // Process Steps
    'process.title': 'Cómo Funciona',
    'process.step1.title': 'Regístrate y Define tu Rol',
    'process.step1.desc': 'Doctor, Hospital, HMO, Investigador o Paciente',
    'process.step2.title': 'Crea un Agente de IA',
    'process.step2.desc': 'Clínico, Administrativo, Investigación o Soporte al Paciente',
    'process.step3.title': 'Personaliza el Avatar',
    'process.step3.desc': 'Apariencia hiperrealista con voz sintética',
    'process.step4.title': 'Entrena con Datos',
    'process.step4.desc': 'Carga protocolos médicos, artículos de investigación y guías',
    'process.step5.title': 'Prueba y Valida',
    'process.step5.desc': 'Pruebas interactivas de texto y voz',
    'process.step6.title': 'Despliega y Escala',
    'process.step6.desc': 'Lanza globalmente o vende en nuestro marketplace de IA',
    'process.cta': 'Comienza a construir tu agente hoy',
    
    // Agents
    'agents.title': 'Nuestros Agentes de IA',
    'agents.aorta.name': 'Agente Aorta',
    'agents.aorta.specialty': 'Cardiología',
    'agents.aorta.desc': 'Apoya la investigación y diagnóstico cardiovascular, especialmente en patologías aórticas.',
    'agents.ojos.name': 'Agente Ojos',
    'agents.ojos.specialty': 'Oftalmología',
    'agents.ojos.desc': 'Asiste en investigación oftalmológica, interpretación de imágenes y soporte al paciente.',
    'agents.coming': 'Próximamente',
    
    // About
    'about.title': 'Acerca de Galatea AI',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.desc': 'Habilitar inteligencia artificial ética, segura y centrada en el ser humano para transformar la atención médica.',
    'about.vision.title': 'Nuestra Visión',
    'about.vision.desc': 'Convertirnos en la plataforma líder para crear y compartir agentes de IA médicos.',
    'about.team.title': 'Equipo Fundador',
    
    // Contact
    'contact.title': 'Contáctanos',
    'contact.name': 'Nombre',
    'contact.email': 'Correo Electrónico',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',
    'contact.sending': 'Enviando...',
    'contact.success': '¡Mensaje enviado exitosamente!',
    'contact.error': 'Error al enviar el mensaje. Inténtalo de nuevo.',
    'contact.email.label': 'Escríbenos directamente a:',
    
    // Footer
    'footer.tagline': 'Agentes de IA seguros e inteligentes para la salud',
    'footer.social': 'Síguenos',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.rights': '© 2024 Galatea AI. Todos los derechos reservados.',

    // Auth
    'auth.title': 'Bienvenido a Galatea AI',
    'auth.description': 'Inicia sesión en tu cuenta o crea una nueva',
    'auth.login': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.loginSignup': 'Registrarse / Iniciar Sesión',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.emailPlaceholder': 'tu@email.com',
    'auth.passwordPlaceholder': 'Ingresa tu contraseña',
    'auth.confirmPasswordPlaceholder': 'Confirma tu contraseña',
    'auth.loginButton': 'Iniciar Sesión',
    'auth.signupButton': 'Crear Cuenta',
    'auth.passwordMismatch': 'Las contraseñas no coinciden',

    // Agent Pages
    'agent.upload.title': 'Subir Datos Médicos',
    'agent.upload.placeholder': 'Ingresa datos del paciente, síntomas, resultados de pruebas o pega registros médicos aquí...',
    'agent.upload.file': 'Subir Archivo',
    'agent.analyze': 'Analizar Datos',
    'agent.analyzing': 'Analizando...',
    'agent.results.title': 'Resultados del Análisis',
    'agent.results.diagnosis': 'Diagnóstico Predicho',
    'agent.results.confidence': 'Nivel de Confianza',
    'agent.results.recommendations': 'Próximos Pasos Recomendados',

    // Custom Agent
    'agents.custom.title': 'Construye Tu Propio Agente',
    'agents.custom.desc': 'Diseña agentes de IA especializados para tus necesidades de salud.',
    'customAgent.title': 'Construye Tu Propio Agente de IA',
    'customAgent.subtitle': 'Crea agentes de IA personalizados adaptados a tu especialidad y necesidades específicas de salud',
    'customAgent.howItWorks': 'Cómo Funciona',
    'customAgent.step1.title': 'Define Tu Especialidad',
    'customAgent.step1.desc': 'Elige tu especialidad médica y define qué hará tu agente',
    'customAgent.step2.title': 'Configura Capacidades',
    'customAgent.step2.desc': 'Selecciona capacidades de IA como soporte diagnóstico, asistencia de investigación o interacción con pacientes',
    'customAgent.step3.title': 'Entrena Tu Agente',
    'customAgent.step3.desc': 'Carga protocolos, guías y literatura médica específica del dominio',
    'customAgent.step4.title': 'Despliega e Itera',
    'customAgent.step4.desc': 'Prueba, valida y mejora continuamente tu agente con retroalimentación del mundo real',
    'customAgent.cta.title': '¿Listo para Construir Tu Agente?',
    'customAgent.cta.desc': 'Contáctanos para comenzar a crear tu agente de IA personalizado hoy',
    'customAgent.cta.button': 'Comenzar',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('galatea-lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('galatea-lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

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
    'hero.title': 'The sovereign infrastructure for the healthcare agentic web',
    'hero.subtitle': 'Empower operations to Build, Deploy, and Scale Autonomous Agents that automate critical Back-Office workflows. The industrial platform for Health-Ops. Secure. Compliant. No-Code.',
    'hero.cta.create': 'Create your AI agent',
    'hero.cta.demo': 'Request a demo',
    
    
    // Agents - Sovereign Agent Library
    'agents.title': 'Sovereign agent library',
    'agents.subtitle': 'Pre-trained, compliant, and ready to integrate into your hospital\'s core workflow.',
    'agents.search': 'Search modules by name or function...',
    'agents.noResults': 'No modules found matching your criteria',
    'agents.loading': 'Loading more modules...',
    'agents.featured': 'Featured',
    'agents.categories.label': 'Domains',
    'agents.categories.all': 'All Modules',
    'agents.categories.clinical_specialties': 'Clinical Specialties',
    'agents.categories.documentation': 'Documentation',
    'agents.categories.surgical': 'Surgical',
    'agents.categories.administrative': 'Administrative',
    'agents.categories.legal_and_compliance': 'Legal & Compliance',
    'agents.categories.research': 'Research',
    'agents.categories.coding_and_billing': 'Revenue Cycle',
    
    // Agent Foundry
    'agents.foundry.title': 'Agent Foundry',
    'agents.foundry.desc': 'Launch the no-code studio to design custom workflows.',
    'agents.foundry.cta': 'Open Studio',
    
    // Agent Modules - Enterprise Names
    'agents.aorta.name': 'Cardiology Protocol Assistant',
    'agents.aorta.specialty': 'Cardiovascular',
    'agents.aorta.desc': 'AI-powered support for cardiovascular research and diagnosis, specializing in aortic pathology protocols.',
    'agents.ojos.name': 'Ophthalmology Decision Support',
    'agents.ojos.specialty': 'Ophthalmology',
    'agents.ojos.desc': 'Clinical decision support for ophthalmologic diagnostics, image interpretation, and patient management.',
    'agents.clinicalDictation.name': 'Automated Clinical Documentation',
    'agents.clinicalDictation.specialty': 'Voice-to-Record',
    'agents.clinicalDictation.desc': 'Enterprise voice recognition that converts clinical dictation into validated, structured EHR-ready records.',
    'agents.compliance.name': 'Medical Audit Guardian',
    'agents.compliance.specialty': 'Compliance Audit',
    'agents.compliance.desc': 'Continuous compliance monitoring and automated auditing against Colombian medical and legal standards.',
    'agents.surgicalNotes.name': 'Surgical Documentation Engine',
    'agents.surgicalNotes.specialty': 'Surgical Records',
    'agents.surgicalNotes.desc': 'Automated generation of complete, audit-ready surgical notes with regulatory compliance.',
    'agents.research.name': 'R&D Evidence Analyzer',
    'agents.research.specialty': 'Research Intelligence',
    'agents.research.desc': 'Advanced research intelligence engine for clinical evidence synthesis and pharmaceutical analysis.',
    'agents.coding.name': 'Sovereign RIPS & Coding Engine',
    'agents.coding.specialty': 'Medical Coding',
    'agents.coding.desc': 'Autonomous CUPS/RIPS coding with glosa prevention algorithms. Core revenue cycle infrastructure.',
    'agents.administration.name': 'Clinical Ops Manager',
    'agents.administration.specialty': 'Operations',
    'agents.administration.desc': 'End-to-end automation for certificates, orders, referrals, disability forms, and authorization workflows.',
    'agents.consent.name': 'Surgical Consent Auditor',
    'agents.consent.specialty': 'Legal Compliance',
    'agents.consent.desc': 'Dynamic consent generation engine with risk stratification based on procedure type and patient profile.',
    'agents.summary.name': 'Patient Discharge Summarizer',
    'agents.summary.specialty': 'Clinical Summary',
    'agents.summary.desc': 'Intelligent synthesis of longitudinal patient data into actionable discharge summaries.',
    'agents.legalReview.name': 'Regulatory Compliance Auditor',
    'agents.legalReview.specialty': 'Risk Management',
    'agents.legalReview.desc': 'Proactive legal review and institutional risk mitigation for clinical documentation.',
    'agents.protocolReview.name': 'Clinical Guideline Navigator',
    'agents.protocolReview.specialty': 'Protocol Intelligence',
    'agents.protocolReview.desc': 'Protocol validation engine that detects inconsistencies and inclusion/exclusion violations.',
    'agents.surgicalProtocols.name': 'Surgical Protocol Orchestrator',
    'agents.surgicalProtocols.specialty': 'Quality Assurance',
    'agents.surgicalProtocols.desc': 'Automated pre-op and post-op checklist generation with compliance tracking.',
    'agents.logbook.name': 'Surgical Case Manager',
    'agents.logbook.specialty': 'Case Documentation',
    'agents.logbook.desc': 'Comprehensive surgical logbook with procedure tracking, outcomes analysis, and credentialing support.',
    'agents.billing.name': 'Revenue Cycle Orchestrator',
    'agents.billing.specialty': 'Revenue Automation',
    'agents.billing.desc': 'Intelligent order processing with OCR extraction, automated classification, and revenue leakage prevention.',
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
    'footer.rights': '© 2025 Galatea AI. All rights reserved.',

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

    // Pricing - Enterprise Licensing
    'nav.pricing': 'Licensing',
    'pricing.title': 'Enterprise licensing models',
    'pricing.subtitle': 'Scalable sovereign infrastructure tailored to your operational volume and compliance needs.',
    'pricing.recommended': 'Recommended',
    'pricing.trust.title': 'Compliance & Certifications',
    
    // Health-Ops Core
    'pricing.core.name': 'Health-Ops Core',
    'pricing.core.tagline': 'For High-Complexity Clinics & IPS',
    'pricing.core.desc': 'Deploy your first ecosystem of autonomous agents to solve a critical bottleneck (e.g., Glosas/Revenue Cycle).',
    'pricing.core.feature1': 'Single-Domain Orchestration',
    'pricing.core.feature2': 'Standard API Integration',
    'pricing.core.feature3': 'Native RIPS & Local Compliance',
    'pricing.core.feature4': '4-Week "White Glove" Deployment',
    'pricing.core.cta': 'Request Deployment Proposal',
    
    // Enterprise Orchestration
    'pricing.enterprise.name': 'Enterprise Orchestration',
    'pricing.enterprise.tagline': 'For Hospital Networks & Payers',
    'pricing.enterprise.desc': 'Full-scale infrastructure to orchestrate multiple departments simultaneously (Finance + Ops + Clinical).',
    'pricing.enterprise.feature1': 'Multi-Domain Ecosystem',
    'pricing.enterprise.feature2': 'Deep Legacy Integration (SAP/Veeva)',
    'pricing.enterprise.feature3': 'Advanced Governance Dashboard',
    'pricing.enterprise.feature4': 'Unlimited Internal Agent Creation',
    'pricing.enterprise.cta': 'Contact Sales',
    
    // Sovereign Dedicated Cloud
    'pricing.sovereign.name': 'Sovereign Dedicated Cloud',
    'pricing.sovereign.tagline': 'For Pharma & Government',
    'pricing.sovereign.desc': 'Maximum security, isolation, and computational sovereignty for highly regulated environments.',
    'pricing.sovereign.feature1': 'Private Cloud Deployment (Isolation)',
    'pricing.sovereign.feature2': 'Zero-Retention Data Guarantee',
    'pricing.sovereign.feature3': 'Custom LLM Fine-Tuning',
    'pricing.sovereign.feature4': 'ISO 27001 / GxP Validation Ready',
    'pricing.sovereign.cta': 'Inquire for Custom Access',

    // About - Mission & Values
    'about.mission.valueTitle': 'Mission & Values',
    'about.mission.value': 'Galatea AI seeks to become the global infrastructure for creating and coordinating hyper-realistic health avatars powered by artificial intelligence. Our vision is that any actor in the system—hospitals, HMOs, pharmaceutical companies, doctors, researchers, or patients—can design, train, and deploy specialized agents that support everything from clinical diagnosis to research and administrative management.',
    
    // About - Problem & Opportunity
    'about.problem.title': 'The Problem',
    'about.problem.desc': 'Today, hospitals, HMOs, universities, and pharmaceutical companies face a common reality: AI projects in healthcare are slow, expensive, and poorly scalable.',
    'about.problem.point1': 'Implementing an AI project can take 12 to 24 months from conception to clinical validation.',
    'about.problem.point2': 'Development costs easily exceed hundreds of thousands of dollars, limiting innovation to large institutions.',
    'about.problem.point3': 'Critical lack of specialized AI technical teams within hospitals and clinics.',
    'about.problem.point4': 'Most initiatives remain isolated pilots that do not scale, generate sustainable revenue, or truly impact clinical practice.',
    'about.opportunity.title': 'The Opportunity',
    'about.opportunity.desc': 'Galatea AI was born to solve this gap. Instead of each hospital or institution assembling a costly technical team from scratch with long development times, our platform offers ready-to-use infrastructure to create, coordinate, and deploy hyper-realistic AI-powered avatars.',
    'about.opportunity.benefit1': 'Create clinical, administrative, research, or patient support agents in minutes, not years.',
    'about.opportunity.benefit2': 'Customize them with institutional protocols, scientific literature, or medical guidelines.',
    
    // About - Business Model
    'about.business.title': 'Business Model',
    'about.business.intro': 'Our model combines SaaS + Marketplace + Premium Services:',
    'about.business.saas': 'Recurring SaaS licenses (B2B and B2C) with scalable plans.',
    'about.business.marketplace': 'AI Agent Marketplace: users can license or sell their own agents, with a transaction fee for Galatea AI (App Store model applied to digital health).',
    'about.business.premium': 'Premium customization and integration services: custom agent development, EHR system integration, administrative workflows, and regulatory compliance (HIPAA, GDPR, local regulations).',
    'about.business.cta': 'View Pricing Plans',
    
    // About - Team
    'about.team.nicolas.name': 'Nicolás Pérez Rivera',
    'about.team.nicolas.title': 'CEO & Co-Founder',
    'about.team.nicolas.bio': 'Bilingual executive specialized in international relations, global commerce, and B2B business development, with over 7 years of experience in sales, commercial development, and data analysis, and 5 years of experience in HealthTech and artificial intelligence applied to healthcare.',
    'about.team.nicolas.highlight1': 'HealthTech Experience: Led AI integration projects with pharmaceutical companies and hospitals, managing multidisciplinary teams.',
    'about.team.nicolas.highlight2': 'Results: Driven 15-20% annual revenue growth through identification of untapped opportunities.',
    'about.team.nicolas.highlight3': 'Vision: As CEO of Galatea AI, leads the mission to democratize access to AI in healthcare worldwide.',
    'about.team.carlos.name': 'Carlos José Pérez Rivera, M.D., M.Sc.',
    'about.team.carlos.title': 'Co-Founder & Chief Medical Officer',
    'about.team.carlos.bio': 'General surgeon, clinical researcher, and university professor with solid academic and international background.',
    'about.team.carlos.highlight1': 'Medical Training: Specialist in General Surgery (Universidad El Bosque), Master in Clinical Epidemiology (Universidad de los Andes).',
    'about.team.carlos.highlight2': 'Research: Author/co-author of over 40 scientific publications. Awards include Paul Dudley White International Scholar Award (AHA 2024).',
    'about.team.carlos.highlight3': 'Role: Guarantees the scientific and medical validity of AI solutions, ensuring clinical relevance and academic rigor.',
    'about.team.cto.name': 'Uriel Rodríguez Castro',
    'about.team.cto.title': 'CTO & Co-Founder',
    'about.team.cto.bio': 'Executive Leader in Enterprise Architecture & Digital Governance 15+ years architecting mission-critical ecosystems for Fortune 500 corporations.',
    'about.team.cto.profile': 'Global Operations: Formerly Head of Global Digital Engineering at Inchcape PLC, leading 300+ engineers across 60 countries. Strategic Trust: Proven track record as C-Level Advisor at NTT DATA and Digital Leader for Chedraui, driving multi-million dollar transformations. Galatea Mission: Building our "Sovereign Infrastructure", ensuring banking-grade security, TOGAF/CGEIT compliance, and seamless integration for healthcare.',
    
    // About - Roadmap
    'about.roadmap.title': 'Strategic Roadmap',
    'about.roadmap.phase1.title': 'Phase 1 – Incubation (0-4 months)',
    'about.roadmap.phase1.point1': 'MVP development with two initial agents: clinical agent (cardiovascular pathology support) and administrative agent (authorizations and appointments).',
    'about.roadmap.phase1.point2': 'Basic technical platform validation: protocol loading, initial training with medical data, text and voice conversation testing.',
    'about.roadmap.phase1.point3': 'Live demo construction for real-time clinical analysis capability.',
    'about.roadmap.phase1.point4': 'First approaches with pilot institutions (university hospital, private clinic, small HMO).',
    'about.roadmap.phase1.goal': 'Goal: Validate technical feasibility and generate interest from partner institutions.',
    'about.roadmap.phase2.title': 'Phase 2 – Initial Traction (5-8 months)',
    'about.roadmap.phase2.point1': 'Launch of first functional version of AI agent marketplace.',
    'about.roadmap.phase2.point2': 'Catalog expansion: agents in oncology, pediatrics, and chronic patient support.',
    'about.roadmap.phase2.point3': 'First paid pilot contracts with hospitals and HMOs for limited use.',
    'about.roadmap.phase2.point4': 'Basic EHR system integration.',
    'about.roadmap.phase2.goal': 'Goal: Demonstrate real adoption and generate first recurring revenue.',
    'about.roadmap.phase3.title': 'Phase 3 – Expansion & Validation (9-12 months)',
    'about.roadmap.phase3.point1': 'Scaling agents in medium and large institutions.',
    'about.roadmap.phase3.point2': 'Creation of specialized agent hub (example: 20 agents in university hospital covering different clinical and administrative areas).',
    'about.roadmap.phase3.point3': 'Start collaboration with pharmaceutical companies and research centers.',
    'about.roadmap.phase3.point4': 'Generation of measurable success cases: 24/7 patient care with AI support.',
    'about.roadmap.phase3.goal': 'Goal: Validate productivity impact and demonstrate model scalability.',
    'about.roadmap.phase4.title': 'Phase 4 – Global Scale (13-16 months)',
    'about.roadmap.phase4.point1': 'International marketplace opening (institutions in Latin America, US, and Europe).',
    'about.roadmap.phase4.point2': 'Strategic alliances with pharmaceutical companies for global R&D agents.',
    'about.roadmap.phase4.point3': 'Expansion to over 100 agents available in marketplace.',
    'about.roadmap.phase4.point4': 'Enterprise plan consolidation: complete integration with large hospital systems, regulatory support.',
    'about.roadmap.phase4.goal': 'Goal: Become the global reference in hyper-realistic AI-powered medical agent infrastructure.',
    
    // How It Works - Enterprise Process
    'howItWorks.title': 'How it works',
    'howItWorks.subtitle': 'Health-ops infrastructure designed to integrate artificial intelligence into real workflow, without disrupting your operation.',
    'howItWorks.step1.title': '1. Bottleneck diagnosis',
    'howItWorks.step1.desc': 'Our architects analyze your back-office processes (billing, portfolio, accounting) to identify where manual operation is draining resources and slowing cash flow.',
    'howItWorks.step2.title': '2. Workflow integration',
    'howItWorks.step2.desc': 'We are not an isolated app. We connect securely (API/VPN) to your legacy systems (HIS/ERP) to read data in real time, closing the operational "learning gap".',
    'howItWorks.step3.title': '3. Autonomous agent deployment',
    'howItWorks.step3.desc': 'We activate ecosystems of sovereign AI agents that execute complex tasks: account audits, RIPS validation and financial reconciliation, working 24/7.',
    'howItWorks.step4.title': '4. Control and profitability',
    'howItWorks.step4.desc': 'The system processes massive volume and your experts validate only exceptions. We transform operational efficiency into EBITDA and cash flow recovered from the first month.',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.agents': 'Agentes',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    
    // Hero
    'hero.title': 'La infraestructura soberana para la web agéntica de salud',
    'hero.subtitle': 'Empodera operaciones para construir, desplegar y escalar agentes autónomos que automatizan flujos críticos de back-office. La plataforma industrial para health-ops. Seguro. Cumplidor. Sin código.',
    'hero.cta.create': 'Crea tu agente de IA',
    'hero.cta.demo': 'Solicita una demo',
    
    // Agents - Sovereign Agent Library
    'agents.title': 'Biblioteca soberana de agentes',
    'agents.subtitle': 'Pre-entrenados, compatibles y listos para integrar en el flujo de trabajo central de su hospital.',
    'agents.search': 'Buscar módulos por nombre o función...',
    'agents.noResults': 'No se encontraron módulos que coincidan con su criterio',
    'agents.loading': 'Cargando más módulos...',
    'agents.featured': 'Destacado',
    'agents.categories.label': 'Dominios',
    'agents.categories.all': 'Todos los Módulos',
    'agents.categories.clinical_specialties': 'Especialidades Clínicas',
    'agents.categories.documentation': 'Documentación',
    'agents.categories.surgical': 'Quirúrgico',
    'agents.categories.administrative': 'Administrativo',
    'agents.categories.legal_and_compliance': 'Legal y Cumplimiento',
    'agents.categories.research': 'Investigación',
    'agents.categories.coding_and_billing': 'Ciclo de Ingresos',
    
    // Agent Foundry
    'agents.foundry.title': 'Agent Foundry',
    'agents.foundry.desc': 'Lanza el estudio no-code para diseñar flujos de trabajo personalizados.',
    'agents.foundry.cta': 'Abrir Estudio',
    
    // Agent Modules - Enterprise Names (Spanish)
    'agents.aorta.name': 'Asistente de Protocolos Cardiología',
    'agents.aorta.specialty': 'Cardiovascular',
    'agents.aorta.desc': 'Soporte con IA para investigación y diagnóstico cardiovascular, especializado en protocolos de patología aórtica.',
    'agents.ojos.name': 'Soporte de Decisión Oftalmología',
    'agents.ojos.specialty': 'Oftalmología',
    'agents.ojos.desc': 'Soporte de decisión clínica para diagnósticos oftalmológicos, interpretación de imágenes y gestión del paciente.',
    'agents.clinicalDictation.name': 'Documentación Clínica Automatizada',
    'agents.clinicalDictation.specialty': 'Voz-a-Registro',
    'agents.clinicalDictation.desc': 'Reconocimiento de voz empresarial que convierte dictados clínicos en registros estructurados listos para HCE.',
    'agents.compliance.name': 'Guardián de Auditoría Médica',
    'agents.compliance.specialty': 'Auditoría de Cumplimiento',
    'agents.compliance.desc': 'Monitoreo continuo de cumplimiento y auditoría automatizada contra estándares médicos y legales colombianos.',
    'agents.surgicalNotes.name': 'Motor de Documentación Quirúrgica',
    'agents.surgicalNotes.specialty': 'Registros Quirúrgicos',
    'agents.surgicalNotes.desc': 'Generación automatizada de notas quirúrgicas completas, listas para auditoría con cumplimiento regulatorio.',
    'agents.research.name': 'Analizador de Evidencia I+D',
    'agents.research.specialty': 'Inteligencia de Investigación',
    'agents.research.desc': 'Motor avanzado de inteligencia en investigación para síntesis de evidencia clínica y análisis farmacéutico.',
    'agents.coding.name': 'Motor Soberano RIPS y Codificación',
    'agents.coding.specialty': 'Codificación Médica',
    'agents.coding.desc': 'Codificación autónoma CUPS/RIPS con algoritmos de prevención de glosas. Infraestructura central del ciclo de ingresos.',
    'agents.administration.name': 'Gestor de Operaciones Clínicas',
    'agents.administration.specialty': 'Operaciones',
    'agents.administration.desc': 'Automatización de extremo a extremo para certificados, órdenes, remisiones, incapacidades y flujos de autorización.',
    'agents.consent.name': 'Auditor de Consentimiento Quirúrgico',
    'agents.consent.specialty': 'Cumplimiento Legal',
    'agents.consent.desc': 'Motor de generación dinámica de consentimientos con estratificación de riesgo según tipo de procedimiento y perfil del paciente.',
    'agents.summary.name': 'Sintetizador de Alta del Paciente',
    'agents.summary.specialty': 'Resumen Clínico',
    'agents.summary.desc': 'Síntesis inteligente de datos longitudinales del paciente en resúmenes de alta accionables.',
    'agents.legalReview.name': 'Auditor de Cumplimiento Regulatorio',
    'agents.legalReview.specialty': 'Gestión de Riesgo',
    'agents.legalReview.desc': 'Revisión legal proactiva y mitigación de riesgo institucional para documentación clínica.',
    'agents.protocolReview.name': 'Navegador de Guías Clínicas',
    'agents.protocolReview.specialty': 'Inteligencia de Protocolos',
    'agents.protocolReview.desc': 'Motor de validación de protocolos que detecta inconsistencias y violaciones de criterios de inclusión/exclusión.',
    'agents.surgicalProtocols.name': 'Orquestador de Protocolos Quirúrgicos',
    'agents.surgicalProtocols.specialty': 'Aseguramiento de Calidad',
    'agents.surgicalProtocols.desc': 'Generación automatizada de checklists pre y post operatorios con seguimiento de cumplimiento.',
    'agents.logbook.name': 'Gestor de Casos Quirúrgicos',
    'agents.logbook.specialty': 'Documentación de Casos',
    'agents.logbook.desc': 'Bitácora quirúrgica integral con seguimiento de procedimientos, análisis de resultados y soporte para acreditación.',
    'agents.billing.name': 'Orquestador del Ciclo de Ingresos',
    'agents.billing.specialty': 'Automatización de Ingresos',
    'agents.billing.desc': 'Procesamiento inteligente de órdenes con extracción OCR, clasificación automatizada y prevención de fugas de ingresos.',
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
    'footer.rights': '© 2025 Galatea AI. Todos los derechos reservados.',

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
    'agents.custom.desc': 'Diseña agentes IA especializados para tus necesidades en salud.',
    'agents.custom.cta': 'Empieza a crear agentes personalizados con capacidades avanzadas de IA adaptadas a tu especialidad médica.',
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

    // Pricing - Enterprise Licensing
    'nav.pricing': 'Licenciamiento',
    'pricing.title': 'Modelos de Licenciamiento Empresarial',
    'pricing.subtitle': 'Infraestructura soberana escalable adaptada a su volumen operativo y necesidades de cumplimiento.',
    'pricing.recommended': 'Recomendado',
    'pricing.trust.title': 'Cumplimiento y Certificaciones',
    
    // Health-Ops Core
    'pricing.core.name': 'Health-Ops Core',
    'pricing.core.tagline': 'Para Clínicas de Alta Complejidad e IPS',
    'pricing.core.desc': 'Despliegue su primer ecosistema de agentes autónomos para resolver un cuello de botella crítico (ej. Glosas/Ciclo de Ingresos).',
    'pricing.core.feature1': 'Orquestación de Dominio Único',
    'pricing.core.feature2': 'Integración API Estándar',
    'pricing.core.feature3': 'RIPS Nativo y Cumplimiento Local',
    'pricing.core.feature4': 'Despliegue "White Glove" en 4 Semanas',
    'pricing.core.cta': 'Solicitar Propuesta de Despliegue',
    
    // Enterprise Orchestration
    'pricing.enterprise.name': 'Enterprise Orchestration',
    'pricing.enterprise.tagline': 'Para Redes Hospitalarias y Pagadores',
    'pricing.enterprise.desc': 'Infraestructura a escala completa para orquestar múltiples departamentos simultáneamente (Finanzas + Ops + Clínico).',
    'pricing.enterprise.feature1': 'Ecosistema Multi-Dominio',
    'pricing.enterprise.feature2': 'Integración Profunda Legacy (SAP/Veeva)',
    'pricing.enterprise.feature3': 'Dashboard de Gobernanza Avanzada',
    'pricing.enterprise.feature4': 'Creación Ilimitada de Agentes Internos',
    'pricing.enterprise.cta': 'Contactar Ventas',
    
    // Sovereign Dedicated Cloud
    'pricing.sovereign.name': 'Sovereign Dedicated Cloud',
    'pricing.sovereign.tagline': 'Para Pharma y Gobierno',
    'pricing.sovereign.desc': 'Máxima seguridad, aislamiento y soberanía computacional para entornos altamente regulados.',
    'pricing.sovereign.feature1': 'Despliegue en Nube Privada (Aislamiento)',
    'pricing.sovereign.feature2': 'Garantía de Cero Retención de Datos',
    'pricing.sovereign.feature3': 'Fine-Tuning de LLM Personalizado',
    'pricing.sovereign.feature4': 'ISO 27001 / Validación GxP Ready',
    'pricing.sovereign.cta': 'Solicitar Acceso Personalizado',

    // About - Mission & Values
    'about.mission.valueTitle': 'Misión y Valores',
    'about.mission.value': 'Galatea AI busca convertirse en la infraestructura global para crear y coordinar avatares hiperrealistas de salud impulsados por inteligencia artificial. Nuestra visión es que cualquier actor del sistema—hospitales, EPS/IPS, farmacéuticas, médicos, investigadores o pacientes—pueda diseñar, entrenar y desplegar agentes especializados que apoyen desde el diagnóstico clínico hasta la investigación y la gestión administrativa.',
    
    // About - Problem & Opportunity
    'about.problem.title': 'El Problema',
    'about.problem.desc': 'Hoy en día, hospitales, EPS/IPS, universidades y farmacéuticas enfrentan una realidad común: los proyectos de inteligencia artificial en salud son lentos, costosos y poco escalables.',
    'about.problem.point1': 'Implementar un proyecto de IA puede tardar 12 a 24 meses desde la concepción hasta la validación clínica.',
    'about.problem.point2': 'Los costos de desarrollo superan fácilmente los cientos de miles de dólares, limitando la innovación a instituciones grandes.',
    'about.problem.point3': 'Existe una falta crítica de equipos técnicos especializados en IA dentro de los hospitales y clínicas.',
    'about.problem.point4': 'La mayoría de las iniciativas quedan como pilotos aislados que no escalan, no generan ingresos sostenibles ni impactan la práctica clínica.',
    'about.opportunity.title': 'La Oportunidad',
    'about.opportunity.desc': 'Galatea AI nace para resolver este vacío. En lugar de que cada hospital o institución arme desde cero un equipo técnico costoso y con largos tiempos de desarrollo, nuestra plataforma ofrece una infraestructura lista para crear, coordinar y desplegar avatares hiperrealistas impulsados por IA.',
    'about.opportunity.benefit1': 'Crear agentes clínicos, administrativos, de investigación o de soporte a pacientes en cuestión de minutos, no años.',
    'about.opportunity.benefit2': 'Personalizarlos con protocolos institucionales, literatura científica o guías médicas.',
    
    // About - Business Model
    'about.business.title': 'Modelo de Negocio',
    'about.business.intro': 'Nuestro modelo combina SaaS + Marketplace + Servicios Premium:',
    'about.business.saas': 'Licencias SaaS recurrentes (B2B y B2C) con planes escalables.',
    'about.business.marketplace': 'Marketplace de agentes AI: los usuarios pueden licenciar o vender sus propios agentes, con un fee de transacción para Galatea AI (modelo tipo App Store aplicado a salud digital).',
    'about.business.premium': 'Servicios premium de personalización e integración: desarrollo de agentes a medida, conexión con sistemas de historia clínica electrónica (EHR), flujos administrativos y cumplimiento regulatorio (HIPAA, GDPR, normativas locales).',
    'about.business.cta': 'Ver Planes de Precios',
    
    // About - Team
    'about.team.nicolas.name': 'Nicolás Pérez Rivera',
    'about.team.nicolas.title': 'CEO y Co-Fundador',
    'about.team.nicolas.bio': 'Ejecutivo bilingüe especializado en relaciones internacionales, comercio global y desarrollo de negocios B2B, con más de 7 años de experiencia en ventas, desarrollo comercial y análisis de datos, y 5 años de experiencia en HealthTech e inteligencia artificial aplicada a salud.',
    'about.team.nicolas.highlight1': 'Experiencia en HealthTech: Ha liderado proyectos de integración de inteligencia artificial con farmacéuticas y hospitales, gestionando equipos multidisciplinarios.',
    'about.team.nicolas.highlight2': 'Resultados: Ha impulsado crecimientos del 15-20% anual en ingresos mediante la identificación de oportunidades no exploradas.',
    'about.team.nicolas.highlight3': 'Visión: Como CEO de Galatea AI, lidera la misión de democratizar el acceso a IA en salud en el mundo.',
    'about.team.carlos.name': 'Carlos José Pérez Rivera, M.D., M.Sc.',
    'about.team.carlos.title': 'Co-Fundador y Director Médico',
    'about.team.carlos.bio': 'Cirujano general, investigador clínico y docente universitario con sólida trayectoria académica e internacional.',
    'about.team.carlos.highlight1': 'Formación médica: Especialista en Cirugía General (Universidad El Bosque), Maestría en Epidemiología Clínica (Universidad de los Andes).',
    'about.team.carlos.highlight2': 'Investigación: Autor/coautor de más de 40 publicaciones científicas. Premios incluyen Paul Dudley White International Scholar Award (AHA 2024).',
    'about.team.carlos.highlight3': 'Rol: Garantiza la validez científica y médica de las soluciones de IA, asegurando relevancia clínica y rigor académico.',
    'about.team.cto.name': 'Uriel Rodríguez Castro',
    'about.team.cto.title': 'CTO & Co-Fundador',
    'about.team.cto.bio': 'Líder Ejecutivo en Arquitectura Empresarial y Gobernanza Digital con más de 15 años arquitectando ecosistemas críticos para corporaciones Fortune 500.',
    'about.team.cto.profile': 'Operaciones Globales: Anteriormente Head of Global Digital Engineering en Inchcape PLC, liderando más de 300 ingenieros en 60 países. Confianza Estratégica: Trayectoria comprobada como C-Level Advisor en NTT DATA y Líder Digital para Chedraui, impulsando transformaciones multimillonarias. Misión Galatea: Construyendo nuestra "Infraestructura Soberana", asegurando seguridad de nivel bancario, cumplimiento TOGAF/CGEIT e integración perfecta para healthcare.',
    
    // About - Roadmap
    'about.roadmap.title': 'Roadmap Estratégico',
    'about.roadmap.phase1.title': 'Fase 1 – Incubación (0-4 meses)',
    'about.roadmap.phase1.point1': 'Desarrollo del MVP con dos agentes iniciales: agente clínico (soporte en patología cardiovascular) y agente administrativo (autorizaciones y citas).',
    'about.roadmap.phase1.point2': 'Validación técnica básica de la plataforma: carga de protocolos, entrenamiento inicial con data médica y pruebas de conversación en texto y voz.',
    'about.roadmap.phase1.point3': 'Construcción de un demo en vivo para mostrar la capacidad de análisis clínico en tiempo real.',
    'about.roadmap.phase1.point4': 'Primeros acercamientos con instituciones piloto (hospital universitario, clínica privada, EPS pequeña).',
    'about.roadmap.phase1.goal': 'Objetivo: Validar la factibilidad técnica y despertar interés de instituciones aliadas.',
    'about.roadmap.phase2.title': 'Fase 2 – Tracción inicial (5-8 meses)',
    'about.roadmap.phase2.point1': 'Lanzamiento de la primera versión funcional del marketplace de agentes AI.',
    'about.roadmap.phase2.point2': 'Ampliación de catálogo: agentes en oncología, pediatría y soporte a pacientes crónicos.',
    'about.roadmap.phase2.point3': 'Primeros contratos piloto pagados con hospitales y EPS para uso limitado.',
    'about.roadmap.phase2.point4': 'Integración básica con sistemas de historias clínicas electrónicas (EHR).',
    'about.roadmap.phase2.goal': 'Objetivo: Demostrar adopción real y generar los primeros ingresos recurrentes.',
    'about.roadmap.phase3.title': 'Fase 3 – Expansión y validación (9-12 meses)',
    'about.roadmap.phase3.point1': 'Escalamiento de agentes en instituciones medianas y grandes.',
    'about.roadmap.phase3.point2': 'Creación de un hub de agentes especializados (ejemplo: 20 agentes en un hospital universitario cubriendo distintas áreas clínicas y administrativas).',
    'about.roadmap.phase3.point3': 'Inicio de colaboración con farmacéuticas y centros de investigación.',
    'about.roadmap.phase3.point4': 'Generación de casos de éxito medibles: atención 24/7 para pacientes con soporte de IA.',
    'about.roadmap.phase3.goal': 'Objetivo: Validar impacto en productividad y demostrar escalabilidad del modelo.',
    'about.roadmap.phase4.title': 'Fase 4 – Escalamiento global (13-16 meses)',
    'about.roadmap.phase4.point1': 'Apertura del marketplace a nivel internacional (instituciones de América Latina, EE. UU. y Europa).',
    'about.roadmap.phase4.point2': 'Alianzas estratégicas con farmacéuticas para agentes de I+D globales.',
    'about.roadmap.phase4.point3': 'Expansión a más de 100 agentes disponibles en el marketplace.',
    'about.roadmap.phase4.point4': 'Consolidación del plan Enterprise: integración completa con sistemas hospitalarios grandes, soporte regulatorio.',
    'about.roadmap.phase4.goal': 'Objetivo: Convertirse en la referencia global en infraestructura de agentes médicos hiperrealistas impulsados por IA.',
    
    // How It Works - Enterprise Process
    'howItWorks.title': 'Cómo funciona',
    'howItWorks.subtitle': 'Infraestructura de health-ops diseñada para integrar inteligencia artificial en el flujo de trabajo real, sin interrumpir su operación.',
    'howItWorks.step1.title': '1. Diagnóstico de cuellos de botella',
    'howItWorks.step1.desc': 'Nuestros arquitectos analizan sus procesos de back-office (facturación, cartera, contabilidad) para identificar dónde la operación manual está drenando recursos y frenando el flujo de caja.',
    'howItWorks.step2.title': '2. Integración al flujo de trabajo',
    'howItWorks.step2.desc': 'No somos una app aislada. Nos conectamos de forma segura (API/VPN) a sus sistemas legados (HIS/ERP) para leer la data en tiempo real, cerrando el "learning gap" operativo.',
    'howItWorks.step3.title': '3. Despliegue de agentes autónomos',
    'howItWorks.step3.desc': 'Activamos ecosistemas de agentes de IA soberanos que ejecutan tareas complejas: auditoría de cuentas, validación de RIPS y conciliación financiera, trabajando 24/7.',
    'howItWorks.step4.title': '4. Control y rentabilidad',
    'howItWorks.step4.desc': 'El sistema procesa el volumen masivo y sus expertos validan solo las excepciones. Transformamos eficiencia operativa en EBITDA y flujo de caja recuperado desde el primer mes.',
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

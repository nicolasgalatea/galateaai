-- Crear bucket para estudios médicos
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-studies', 'medical-studies', false);

-- Crear tabla de conversaciones
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'sofia',
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de mensajes
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image', 'file')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de casos médicos
CREATE TABLE public.medical_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  patient_age INTEGER,
  patient_gender TEXT CHECK (patient_gender IN ('masculino', 'femenino', 'otro')),
  symptoms TEXT,
  medical_history TEXT,
  current_medications TEXT,
  study_files TEXT[], -- URLs de archivos en storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de diagnósticos
CREATE TABLE public.medical_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_case_id UUID NOT NULL REFERENCES public.medical_cases(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  primary_diagnosis TEXT NOT NULL,
  differential_diagnoses TEXT[],
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  recommendations TEXT,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'critical')),
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_diagnoses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = messages.conversation_id 
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = messages.conversation_id 
  AND conversations.user_id = auth.uid()
));

-- Políticas RLS para medical_cases
CREATE POLICY "Users can view their own medical cases" 
ON public.medical_cases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medical cases" 
ON public.medical_cases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical cases" 
ON public.medical_cases FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para medical_diagnoses
CREATE POLICY "Users can view diagnoses for their cases" 
ON public.medical_diagnoses FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.medical_cases 
  WHERE medical_cases.id = medical_diagnoses.medical_case_id 
  AND medical_cases.user_id = auth.uid()
));

CREATE POLICY "Users can create diagnoses for their cases" 
ON public.medical_diagnoses FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.medical_cases 
  WHERE medical_cases.id = medical_diagnoses.medical_case_id 
  AND medical_cases.user_id = auth.uid()
));

-- Políticas de almacenamiento para medical-studies bucket
CREATE POLICY "Users can view their own medical studies" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'medical-studies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own medical studies" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'medical-studies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medical studies" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'medical-studies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medical studies" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'medical-studies' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_cases_updated_at
  BEFORE UPDATE ON public.medical_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
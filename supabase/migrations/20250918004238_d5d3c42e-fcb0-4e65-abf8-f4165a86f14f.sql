-- CORRECCIÓN CRÍTICA DE SEGURIDAD: Tabla diagnosticos_aorta
-- Eliminar política peligrosa que permite acceso público total

DROP POLICY IF EXISTS "Allow all access to diagnosticos_aorta" ON public.diagnosticos_aorta;

-- Crear función de seguridad para verificar roles médicos autorizados
CREATE OR REPLACE FUNCTION public.is_medical_professional()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el usuario está autenticado
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el usuario tiene un rol médico autorizado
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role IN ('medico', 'hospital')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- POLÍTICAS SEGURAS PARA DIAGNÓSTICOS MÉDICOS

-- Solo profesionales médicos pueden VER diagnósticos
CREATE POLICY "Medical professionals can view diagnoses" 
ON public.diagnosticos_aorta FOR SELECT 
USING (public.is_medical_professional());

-- Solo profesionales médicos pueden CREAR diagnósticos
CREATE POLICY "Medical professionals can create diagnoses" 
ON public.diagnosticos_aorta FOR INSERT 
WITH CHECK (public.is_medical_professional());

-- Solo profesionales médicos pueden ACTUALIZAR diagnósticos
CREATE POLICY "Medical professionals can update diagnoses" 
ON public.diagnosticos_aorta FOR UPDATE 
USING (public.is_medical_professional());

-- NUNCA permitir eliminación de registros médicos (auditoría)
-- Los diagnósticos médicos NO se deben eliminar por razones de auditoría médica

-- Agregar auditoría médica: crear función para registrar accesos
CREATE OR REPLACE FUNCTION public.log_medical_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar acceso a datos médicos para auditoría
  INSERT INTO public.profiles (user_id, email, full_name, updated_at)
  VALUES (auth.uid(), 'audit_log', 'Medical data access logged', now())
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para auditoría de accesos médicos
CREATE TRIGGER audit_medical_diagnoses_access
  AFTER SELECT OR INSERT OR UPDATE ON public.diagnosticos_aorta
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_medical_access();
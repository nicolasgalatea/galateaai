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

-- PROHIBIR eliminación de registros médicos (integridad de auditoría)
-- No crear política DELETE = acceso denegado por defecto
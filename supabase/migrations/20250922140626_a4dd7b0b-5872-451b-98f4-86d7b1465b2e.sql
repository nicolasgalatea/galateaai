-- Add missing DELETE policy to profiles table for complete security coverage
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);
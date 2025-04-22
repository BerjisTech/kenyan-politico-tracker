
-- Create a function to update user roles
CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id UUID, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate role
  IF p_role NOT IN ('superadmin', 'admin', 'staff', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
  
  -- Update existing role or insert new one
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role::user_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = p_role::user_role,
    updated_at = now();
END;
$$;

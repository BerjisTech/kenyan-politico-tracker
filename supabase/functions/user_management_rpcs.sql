
-- Function to get user role safely without recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role_safely(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- Function to safely update a user's role
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

-- Function to get users with roles for paginated results
CREATE OR REPLACE FUNCTION public.get_users_with_roles(
  page_number integer,
  page_size integer
)
RETURNS TABLE (
  user_id uuid,
  role text,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    ur.role::text,
    NULL::text as email, -- Email not available directly
    p.first_name,
    p.last_name,
    p.created_at
  FROM 
    public.user_roles ur
  LEFT JOIN
    public.profiles p ON ur.user_id = p.id
  ORDER BY ur.created_at DESC
  LIMIT page_size
  OFFSET ((page_number - 1) * page_size);
END;
$$;

-- Function to get total count of users
CREATE OR REPLACE FUNCTION public.get_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total integer;
BEGIN
  SELECT COUNT(*) INTO total FROM public.user_roles;
  RETURN total;
END;
$$;

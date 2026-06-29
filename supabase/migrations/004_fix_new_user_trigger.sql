-- Fix handle_new_user to safely handle GoTrue internal re-inserts
-- (e.g. during OTP flow) that would otherwise conflict on public.users PK.
-- SET search_path = public is required: newer Supabase runs triggers with a
-- restricted search_path, so unqualified "users" can't be resolved otherwise.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

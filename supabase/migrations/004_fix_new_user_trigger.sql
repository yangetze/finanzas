-- Fix handle_new_user to safely handle GoTrue internal re-inserts
-- (e.g. during OTP flow) that would otherwise conflict on public.users PK.
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

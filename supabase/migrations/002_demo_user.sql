-- Create the demo user with email pre-confirmed so password auth works
-- without requiring email confirmation to be disabled globally.
-- Password: sobres-demo-2025

DO $$
DECLARE
  demo_id uuid := gen_random_uuid();
  usdc_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'sobres@finanzas.com') THEN
    RETURN;
  END IF;

  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    demo_id, 'authenticated', 'authenticated',
    'sobres@finanzas.com',
    crypt('sobres-demo-2025', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );

  SELECT id INTO usdc_id FROM currencies WHERE code = 'USDC' LIMIT 1;

  UPDATE users
  SET onboarding_done = true, base_currency_id = usdc_id, name = 'Demo'
  WHERE id = demo_id;
END $$;

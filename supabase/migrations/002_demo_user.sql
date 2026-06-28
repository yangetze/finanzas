-- Create the demo user with email pre-confirmed and identity record
-- so GoTrue's signInWithPassword works without email confirmation.
-- Password: sobres-demo-2025
-- Idempotent: deletes and recreates so a stale/broken demo user is always reset.

DO $$
DECLARE
  demo_id uuid := gen_random_uuid();
  usdc_id uuid;
BEGIN
  -- Remove any previous demo user so we start clean.
  DELETE FROM auth.identities WHERE provider_id = 'sobres@finanzas.com' AND provider = 'email';
  DELETE FROM auth.users WHERE email = 'sobres@finanzas.com';

  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    demo_id, 'authenticated', 'authenticated',
    'sobres@finanzas.com',
    crypt('sobres-demo-2025', gen_salt('bf', 10)),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Demo"}',
    false
  );

  -- GoTrue requires a matching identity row for signInWithPassword to work.
  -- provider_id = email for the email provider.
  -- email column is generated from identity_data so must be omitted.
  INSERT INTO auth.identities (
    id, provider_id, user_id, provider, identity_data, created_at, updated_at, last_sign_in_at
  ) VALUES (
    gen_random_uuid(),
    'sobres@finanzas.com',
    demo_id,
    'email',
    jsonb_build_object('sub', demo_id::text, 'email', 'sobres@finanzas.com', 'email_verified', true, 'phone_verified', false),
    NOW(), NOW(), NOW()
  );

  SELECT id INTO usdc_id FROM currencies WHERE code = 'USDC' LIMIT 1;
  UPDATE users SET onboarding_done = true, base_currency_id = usdc_id, name = 'Demo' WHERE id = demo_id;
END $$;

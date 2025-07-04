-- This script shows the settings that need to be changed in Supabase Dashboard
-- These cannot be executed via SQL, but need to be set in the Supabase Dashboard

-- Go to Authentication > Settings in your Supabase Dashboard and set:
-- 1. Enable email confirmations: OFF
-- 2. Enable phone confirmations: OFF  
-- 3. Enable email change confirmations: OFF

-- Alternatively, you can use the Supabase CLI or Management API to update these settings

-- For testing purposes, you can also create users directly in the auth.users table
-- But this is not recommended for production

-- Create test users directly (DEVELOPMENT ONLY)
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   gen_random_uuid(),
--   '9999@b-p.co.jp',
--   crypt('admin', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '',
--   '',
--   '',
--   ''
-- );

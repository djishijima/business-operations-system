-- Fix email mismatch between auth.users and public.users

-- Update public.users table to match auth.users emails
UPDATE public.users 
SET email = 'admin@b-p.co.jp' 
WHERE employee_id = '9999';

UPDATE public.users 
SET email = 'user@b-p.co.jp' 
WHERE employee_id = '0';

-- Verify the update
SELECT employee_id, name, email, role FROM public.users;

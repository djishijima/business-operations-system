-- Create test users in Supabase Auth
-- Note: These need to be created through Supabase Dashboard or Auth API
-- This is a reference for the users that should exist

-- Test User 1 (Admin)
-- Email: tanaka@company.com
-- Password: password123
-- This user should be created in Supabase Auth dashboard

-- Test User 2 (Regular User)  
-- Email: sato@company.com
-- Password: password123

-- Test User 3 (Regular User)
-- Email: suzuki@company.com  
-- Password: password123

-- After creating users in Supabase Auth, update the users table with the correct auth IDs
-- You'll need to get the actual UUID from auth.users table and update accordingly

-- Example update (replace with actual UUIDs from auth.users):
-- UPDATE public.users SET id = 'actual-auth-uuid-here' WHERE employee_id = 'EMP001';

-- Temporarily disable RLS for testing
-- WARNING: Only use this for development/testing

-- Disable RLS on all tables for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nextcloud_files DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable RLS in production by running:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

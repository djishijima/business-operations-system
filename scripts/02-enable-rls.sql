-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nextcloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Leads policies
CREATE POLICY "Users can view all leads" ON public.leads
    FOR SELECT USING (true);
CREATE POLICY "Users can create leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update leads they created or are assigned to" ON public.leads
    FOR UPDATE USING (
        auth.uid()::text = created_by::text OR 
        auth.uid()::text = assigned_to::text
    );
CREATE POLICY "Users can delete leads" ON public.leads
    FOR DELETE USING (true);

-- Daily reports policies
CREATE POLICY "Users can view their own reports" ON public.daily_reports
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own reports" ON public.daily_reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own reports" ON public.daily_reports
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON public.tasks
    FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
    FOR UPDATE USING (
        auth.uid()::text = created_by::text OR 
        auth.uid()::text = assigned_to::text
    );
CREATE POLICY "Users can delete tasks" ON public.tasks
    FOR DELETE USING (true);

-- Approvals policies
CREATE POLICY "Users can view all approvals" ON public.approvals
    FOR SELECT USING (true);
CREATE POLICY "Users can create approvals" ON public.approvals
    FOR INSERT WITH CHECK (auth.uid()::text = requested_by::text);
CREATE POLICY "Users can update approvals they requested" ON public.approvals
    FOR UPDATE USING (auth.uid()::text = requested_by::text);

-- Payment recipients policies
CREATE POLICY "Users can view all payment recipients" ON public.payment_recipients
    FOR SELECT USING (true);
CREATE POLICY "Users can create payment recipients" ON public.payment_recipients
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update payment recipients they created" ON public.payment_recipients
    FOR UPDATE USING (auth.uid()::text = created_by::text);
CREATE POLICY "Users can delete payment recipients" ON public.payment_recipients
    FOR DELETE USING (true);

-- Application codes policies
CREATE POLICY "Users can view all application codes" ON public.application_codes
    FOR SELECT USING (true);
CREATE POLICY "Users can create application codes" ON public.application_codes
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update application codes they created" ON public.application_codes
    FOR UPDATE USING (auth.uid()::text = created_by::text);
CREATE POLICY "Admins can manage application codes" ON public.application_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Nextcloud files policies
CREATE POLICY "Users can view all files" ON public.nextcloud_files
    FOR SELECT USING (true);
CREATE POLICY "Users can upload files" ON public.nextcloud_files
    FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by::text);
CREATE POLICY "Users can delete their own files" ON public.nextcloud_files
    FOR DELETE USING (auth.uid()::text = uploaded_by::text);

-- Projects policies
CREATE POLICY "Users can view all projects" ON public.projects
    FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update projects they created" ON public.projects
    FOR UPDATE USING (auth.uid()::text = created_by::text);

-- Payments policies
CREATE POLICY "Users can view all payments" ON public.payments
    FOR SELECT USING (true);
CREATE POLICY "Users can create payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Users can update payments they created" ON public.payments
    FOR UPDATE USING (auth.uid()::text = created_by::text);

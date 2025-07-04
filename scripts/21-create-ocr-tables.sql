-- OCR Projects table
CREATE TABLE IF NOT EXISTS public.ocr_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    paper_width_mm DECIMAL(8,2),
    paper_height_mm DECIMAL(8,2),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR Documents table
CREATE TABLE IF NOT EXISTS public.ocr_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.ocr_projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    page_count INTEGER,
    processing_status VARCHAR(50) DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')),
    ocr_result JSONB,
    confidence_score DECIMAL(5,4),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR Processing Jobs table
CREATE TABLE IF NOT EXISTS public.ocr_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.ocr_documents(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('ocr', 'layout_analysis', 'text_extraction', 'formatting')),
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    result_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for OCR tables
CREATE INDEX IF NOT EXISTS idx_ocr_documents_project_id ON public.ocr_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_ocr_documents_status ON public.ocr_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_ocr_processing_jobs_document_id ON public.ocr_processing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_processing_jobs_status ON public.ocr_processing_jobs(status);

-- Enable RLS on OCR tables
ALTER TABLE public.ocr_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for OCR tables
CREATE POLICY "Users can view all OCR projects" ON public.ocr_projects
    FOR SELECT USING (true);

CREATE POLICY "Users can create OCR projects" ON public.ocr_projects
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update OCR projects they created" ON public.ocr_projects
    FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can view all OCR documents" ON public.ocr_documents
    FOR SELECT USING (true);

CREATE POLICY "Users can create OCR documents" ON public.ocr_documents
    FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by::text);

CREATE POLICY "Users can update OCR documents they uploaded" ON public.ocr_documents
    FOR UPDATE USING (auth.uid()::text = uploaded_by::text);

CREATE POLICY "Users can view all OCR processing jobs" ON public.ocr_processing_jobs
    FOR SELECT USING (true);

CREATE POLICY "System can manage OCR processing jobs" ON public.ocr_processing_jobs
    FOR ALL USING (true);

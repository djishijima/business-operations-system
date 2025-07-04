-- Insert sample users
INSERT INTO public.users (id, email, name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', '管理者', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com', '田中太郎', 'user'),
    ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com', '佐藤花子', 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES
    ('システム設計書作成', '新システムの設計書を作成する', 'in_progress', 'high', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NOW() + INTERVAL '7 days'),
    ('データベース構築', 'PostgreSQLデータベースの構築', 'pending', 'medium', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', NOW() + INTERVAL '14 days'),
    ('UI/UXデザイン', 'ユーザーインターフェースのデザイン', 'completed', 'medium', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '3 days');

-- Insert sample approvals
INSERT INTO public.approvals (title, description, status, category, amount, requested_by) VALUES
    ('新サーバー購入申請', '開発用サーバーの購入申請', 'pending', 'equipment', 500000.00, '550e8400-e29b-41d4-a716-446655440001'),
    ('出張費申請', '東京出張の交通費・宿泊費', 'approved', 'travel', 80000.00, '550e8400-e29b-41d4-a716-446655440002'),
    ('ソフトウェアライセンス', '開発ツールのライセンス購入', 'pending', 'software', 120000.00, '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample payment recipients
INSERT INTO public.payment_recipients (name, email, phone, address, bank_name, account_holder, created_by) VALUES
    ('株式会社サンプル', 'contact@sample.co.jp', '03-1234-5678', '東京都渋谷区1-1-1', '三菱UFJ銀行', '株式会社サンプル', '550e8400-e29b-41d4-a716-446655440000'),
    ('フリーランス太郎', 'freelancer@example.com', '090-1234-5678', '大阪府大阪市2-2-2', 'みずほ銀行', '山田太郎', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample application codes
INSERT INTO public.application_codes (code, name, description, category, created_by) VALUES
    ('PROJ001', 'Webサイト開発', 'Webサイト開発プロジェクト', 'development', '550e8400-e29b-41d4-a716-446655440000'),
    ('PROJ002', 'システム保守', 'システム保守・運用', 'maintenance', '550e8400-e29b-41d4-a716-446655440000'),
    ('TRAIN001', '研修費用', '社員研修関連費用', 'training', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample projects
INSERT INTO public.projects (project_name, client_name, description, status, start_date, budget, created_by) VALUES
    ('ECサイト構築プロジェクト', '株式会社ABC', 'オンラインショップの構築', 'active', '2024-01-01', 2000000.00, '550e8400-e29b-41d4-a716-446655440000'),
    ('社内システム改修', '自社', '既存システムの機能改修', 'active', '2024-02-01', 800000.00, '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample leads
INSERT INTO public.leads (company_name, contact_person, email, phone, status, source, estimated_value, assigned_to, created_by) VALUES
    ('株式会社XYZ', '鈴木一郎', 'suzuki@xyz.co.jp', '03-9876-5432', 'qualified', 'web_inquiry', 1500000.00, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000'),
    ('DEF商事', '高橋美咲', 'takahashi@def.co.jp', '06-1111-2222', 'contacted', 'referral', 800000.00, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000');

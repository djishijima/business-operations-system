-- Clear existing users
DELETE FROM public.users;

-- Insert test users (these will be updated with actual auth UUIDs after user creation)
INSERT INTO public.users (employee_id, name, email, role) VALUES
  ('9999', '管理者', '9999@b-p.co.jp', 'admin'),
  ('0', 'ユーザー', '0@b-p.co.jp', 'user');

-- Update sample leads with proper assigned_to references
UPDATE public.leads SET assigned_to = NULL;

-- Insert sample application codes
INSERT INTO public.application_codes (code, label, category, description) VALUES
  ('EXP_TRAVEL', '出張費', 'expense_category', '出張に関する経費'),
  ('EXP_MEAL', '会議費', 'expense_category', '会議・接待に関する経費'),
  ('EXP_SUPPLY', '消耗品費', 'expense_category', '事務用品等の消耗品'),
  ('TASK_DEV', '開発作業', 'task_type', 'システム開発関連のタスク'),
  ('TASK_MEET', '会議', 'task_type', '会議・打ち合わせ'),
  ('TASK_DOC', '資料作成', 'task_type', '資料・文書作成作業')
ON CONFLICT (code) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (name, company_name, status, contact_email, contact_phone, notes) VALUES
  ('山田太郎', '株式会社ABC', 'new', 'yamada@abc.co.jp', '03-1234-5678', '新規問い合わせ'),
  ('田中花子', '有限会社XYZ', 'contacted', 'tanaka@xyz.co.jp', '03-9876-5432', '初回面談済み'),
  ('佐藤次郎', '株式会社DEF', 'qualified', 'sato@def.co.jp', '03-5555-1111', '提案書提出予定')
ON CONFLICT DO NOTHING;

-- Insert sample payment recipients
INSERT INTO public.payment_recipients (recipient_name, bank_name, bank_code, branch_name, branch_code, account_type, account_number, account_holder) VALUES
  ('株式会社サンプル', 'みずほ銀行', '0001', '新宿支店', '001', 'ordinary', '1234567', 'カ）サンプル'),
  ('田中商事', '三菱UFJ銀行', '0005', '渋谷支店', '002', 'ordinary', '7654321', 'タナカショウジ')
ON CONFLICT DO NOTHING;

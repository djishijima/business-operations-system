-- Create external relations for payment recipients and application codes

-- Add foreign key columns to approvals table
ALTER TABLE public.approvals 
ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES payment_recipients(id),
ADD COLUMN IF NOT EXISTS application_code text REFERENCES application_codes(code);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approvals_recipient_id ON approvals(recipient_id);
CREATE INDEX IF NOT EXISTS idx_approvals_application_code ON approvals(application_code);

-- Update application_codes with approval-specific codes
INSERT INTO application_codes (code, label, category, description, is_active) VALUES
('EXP-001', '経費精算', 'expense', '一般的な経費精算申請', true),
('EXP-002', '備品購入', 'expense', '備品・消耗品の購入申請', true),
('EXP-003', 'ソフトウェア購入', 'expense', 'ソフトウェア・ライセンス購入', true),
('TRP-001', '交通費精算', 'transport', '交通費の精算申請', true),
('TRP-002', '出張申請', 'transport', '出張に伴う交通費申請', true),
('LEV-001', '有給休暇', 'leave', '有給休暇の取得申請', true),
('LEV-002', '特別休暇', 'leave', '特別休暇の取得申請', true),
('LEV-003', '病気休暇', 'leave', '病気による休暇申請', true),
('DEC-001', '稟議決裁', 'no_cost', '金額を伴わない決裁申請', true),
('DEC-002', '契約承認', 'no_cost', '契約内容の承認申請', true),
('APP-001', '一般承認', 'approval_only', '一般的な承認申請', true),
('APP-002', '企画承認', 'approval_only', '企画・提案の承認申請', true),
('ABS-001', '欠勤届', 'absence', '欠勤の事前・事後報告', true),
('ABS-002', '遅刻・早退届', 'absence', '遅刻・早退の報告', true)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Add sample payment recipients if not exists
INSERT INTO payment_recipients (recipient_name, bank_name, bank_code, branch_name, branch_code, account_type, account_number, account_holder, phone, email) VALUES
('株式会社サンプル商事', 'みずほ銀行', '0001', '新宿支店', '001', 'ordinary', '1234567', 'カ）サンプルショウジ', '03-1234-5678', 'info@sample-corp.co.jp'),
('合同会社テックソリューション', '三菱UFJ銀行', '0005', '渋谷支店', '123', 'ordinary', '7654321', 'ゴウ）テックソリューション', '03-9876-5432', 'contact@tech-solution.co.jp'),
('個人事業主 田中太郎', 'りそな銀行', '0010', '池袋支店', '456', 'ordinary', '1111111', 'タナカ タロウ', '090-1234-5678', 'tanaka@example.com'),
('Amazon Web Services', 'PayPal', '', '', '', '', '', 'AWS', '', 'aws-billing@amazon.com'),
('Microsoft Corporation', 'クレジットカード決済', '', '', '', '', '', 'Microsoft', '', 'billing@microsoft.com')
ON CONFLICT DO NOTHING;

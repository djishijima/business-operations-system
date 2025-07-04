-- ☠️ HellBuild Phase R - application_code カラム緊急追加
-- approvals テーブルに application_code と recipient_id を追加

-- 1. application_code カラム追加（申請種別コード）
ALTER TABLE public.approvals 
ADD COLUMN IF NOT EXISTS application_code text;

-- 2. recipient_id カラム追加（支払先参照）
ALTER TABLE public.approvals 
ADD COLUMN IF NOT EXISTS recipient_id uuid;

-- 3. 外部キー制約追加（参照整合性保証）
ALTER TABLE public.approvals 
ADD CONSTRAINT IF NOT EXISTS fk_approvals_application_code 
FOREIGN KEY (application_code) REFERENCES public.application_codes(code);

ALTER TABLE public.approvals 
ADD CONSTRAINT IF NOT EXISTS fk_approvals_recipient 
FOREIGN KEY (recipient_id) REFERENCES public.payment_recipients(id);

-- 4. インデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_approvals_application_code ON public.approvals(application_code);
CREATE INDEX IF NOT EXISTS idx_approvals_recipient_id ON public.approvals(recipient_id);

-- 5. 既存データの application_code を一時的に設定
UPDATE public.approvals 
SET application_code = CASE 
  WHEN category = 'expense' THEN 'EXP-001'
  WHEN category = 'travel' THEN 'TRP-001'
  WHEN category = 'leave' THEN 'LEV-001'
  WHEN category = 'purchase' THEN 'EXP-002'
  ELSE 'APP-001'
END
WHERE application_code IS NULL;

-- 6. application_code を NOT NULL に変更
ALTER TABLE public.approvals 
ALTER COLUMN application_code SET NOT NULL;

COMMENT ON COLUMN public.approvals.application_code IS '申請種別コード（例：EXP-001, TRP-001）';
COMMENT ON COLUMN public.approvals.recipient_id IS '支払先ID（payment_recipients参照）';

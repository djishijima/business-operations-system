-- ☠️ HellBuild Phase R - 既存申請データの application_code 修復
-- 既存の approvals データに適切な application_code を設定

-- 1. カテゴリ別に適切な application_code を設定
UPDATE public.approvals 
SET application_code = CASE 
  WHEN category = 'expense' AND (form->>'amount')::numeric > 100000 THEN 'EXP-001'
  WHEN category = 'expense' AND (form->>'amount')::numeric <= 100000 THEN 'EXP-002'
  WHEN category = 'travel' THEN 'TRP-002'
  WHEN category = 'leave' THEN 'LEV-001'
  WHEN category = 'purchase' THEN 'PUR-001'
  ELSE 'APP-001'
END
WHERE application_code IN ('UNKNOWN', 'UNKNOWN-expense', 'UNKNOWN-travel', 'UNKNOWN-leave', 'UNKNOWN-purchase', 'UNKNOWN-other')
   OR application_code IS NULL;

-- 2. recipient_id の設定（経費・購入申請のみ）
-- 最初の支払先を仮設定（実際の運用では手動選択が必要）
UPDATE public.approvals 
SET recipient_id = (
  SELECT id FROM public.payment_recipients 
  WHERE recipient_name LIKE '%株式会社%' 
  LIMIT 1
)
WHERE category IN ('expense', 'purchase', 'travel') 
  AND recipient_id IS NULL
  AND EXISTS (SELECT 1 FROM public.payment_recipients LIMIT 1);

-- 3. データ整合性確認
SELECT 
  category,
  application_code,
  COUNT(*) as count
FROM public.approvals 
GROUP BY category, application_code
ORDER BY category, application_code;

-- 4. 外部キー制約違反チェック
SELECT 
  a.id,
  a.application_code,
  a.recipient_id
FROM public.approvals a
LEFT JOIN public.application_codes ac ON a.application_code = ac.code
LEFT JOIN public.payment_recipients pr ON a.recipient_id = pr.id
WHERE ac.code IS NULL 
   OR (a.recipient_id IS NOT NULL AND pr.id IS NULL);

-- ☠️ HellBuild Phase R - 申請コードマスターデータ完全投入
-- 6カテゴリ×各4-5コードの完全データセット

-- 1. 経費申請コード（EXP-001～005）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('EXP-001', '備品購入申請', 'expense', 'オフィス用品・機器等の購入申請', true),
('EXP-002', 'ソフトウェア購入申請', 'expense', 'ソフトウェアライセンス・SaaS契約申請', true),
('EXP-003', '外注費申請', 'expense', '外部委託・業務委託費用申請', true),
('EXP-004', '広告宣伝費申請', 'expense', '広告・マーケティング費用申請', true),
('EXP-005', '研修費申請', 'expense', '社員研修・セミナー参加費申請', true)
ON CONFLICT (code) DO NOTHING;

-- 2. 交通費申請コード（TRP-001～004）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('TRP-001', '通勤交通費申請', 'travel', '定期券・通勤費用申請', true),
('TRP-002', '出張交通費申請', 'travel', '出張時の交通費・宿泊費申請', true),
('TRP-003', '営業交通費申請', 'travel', '営業活動に伴う交通費申請', true),
('TRP-004', '会議交通費申請', 'travel', '会議・打合せ時の交通費申請', true)
ON CONFLICT (code) DO NOTHING;

-- 3. 有給休暇申請コード（LEV-001～004）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('LEV-001', '年次有給休暇申請', 'leave', '年次有給休暇の取得申請', true),
('LEV-002', '半日有給休暇申請', 'leave', '半日単位の有給休暇申請', true),
('LEV-003', '時間有給休暇申請', 'leave', '時間単位の有給休暇申請', true),
('LEV-004', '特別休暇申請', 'leave', '慶弔・病気等の特別休暇申請', true)
ON CONFLICT (code) DO NOTHING;

-- 4. 金額なし決済コード（NOC-001～003）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('NOC-001', '業務承認申請', 'other', '金額を伴わない業務承認申請', true),
('NOC-002', '方針決定申請', 'other', '事業方針・戦略決定の承認申請', true),
('NOC-003', '契約承認申請', 'other', '契約締結・変更の承認申請', true)
ON CONFLICT (code) DO NOTHING;

-- 5. 決裁のみコード（APP-001～003）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('APP-001', '稟議申請', 'other', '稟議書による決裁申請', true),
('APP-002', '緊急承認申請', 'other', '緊急時の事後承認申請', true),
('APP-003', '変更承認申請', 'other', '既存決定事項の変更承認申請', true)
ON CONFLICT (code) DO NOTHING;

-- 6. 欠勤報告コード（ABS-001～004）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('ABS-001', '病気欠勤報告', 'other', '病気による欠勤の報告', true),
('ABS-002', '遅刻報告', 'other', '遅刻の事由報告', true),
('ABS-003', '早退報告', 'other', '早退の事由報告', true),
('ABS-004', '私用欠勤報告', 'other', '私用による欠勤報告', true)
ON CONFLICT (code) DO NOTHING;

-- 7. 購入申請コード（PUR-001～003）
INSERT INTO public.application_codes (code, label, category, description, is_active) VALUES
('PUR-001', '設備購入申請', 'purchase', '設備・機械の購入申請', true),
('PUR-002', '消耗品購入申請', 'purchase', '消耗品・事務用品の購入申請', true),
('PUR-003', 'システム導入申請', 'purchase', 'システム・ツール導入申請', true)
ON CONFLICT (code) DO NOTHING;

-- 8. インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_application_codes_category ON public.application_codes(category);
CREATE INDEX IF NOT EXISTS idx_application_codes_active ON public.application_codes(is_active);

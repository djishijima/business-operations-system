-- 承認申請の6カテゴリ完全対応のフィールド定義修正

-- 既存の承認申請フィールド定義を削除
DELETE FROM public.field_definitions WHERE module_name = 'approvals';

-- 共通フィールド（全カテゴリ共通）
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'category', 'カテゴリ', 'select', true, false, false, 0, null, '申請の種類'),
  ('approvals', 'title', 'タイトル', 'text', true, true, true, 1, '申請のタイトルを入力', '申請の概要・件名'),
  ('approvals', 'description', '詳細説明', 'textarea', false, true, false, 99, '詳細な説明を入力してください', '申請の詳細内容・補足事項');

-- 経費上申専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description, options) VALUES
  ('approvals', 'expense_amount', '金額', 'number', true, true, true, 10, '0', '申請金額（円）'),
  ('approvals', 'expense_category', '経費種別', 'select', true, true, true, 11, null, '経費の分類'),
  ('approvals', 'vendor_name', '支払先', 'text', false, true, true, 12, '株式会社○○', '支払先の会社名・店舗名'),
  ('approvals', 'receipt_date', 'レシート日付', 'date', true, false, false, 13, null, 'レシート・領収書の日付'),
  ('approvals', 'business_purpose', '業務目的', 'textarea', true, true, true, 14, '業務上の目的を詳しく記載', '経費使用の業務上の理由');

-- 交通費精算専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'transport_amount', '交通費', 'number', true, true, true, 20, '0', '交通費の合計金額'),
  ('approvals', 'departure', '出発地', 'text', true, true, true, 21, '東京駅', '出発地点'),
  ('approvals', 'destination', '到着地', 'text', true, true, true, 22, '大阪駅', '到着地点'),
  ('approvals', 'transport_date', '利用日', 'date', true, false, false, 23, null, '交通機関利用日'),
  ('approvals', 'transport_method', '交通手段', 'select', true, false, false, 24, null, '利用した交通機関'),
  ('approvals', 'round_trip', '往復', 'boolean', false, false, false, 25, null, '往復利用の場合チェック');

-- 有給休暇上申専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'leave_start_date', '開始日', 'date', true, false, true, 30, null, '休暇開始日'),
  ('approvals', 'leave_end_date', '終了日', 'date', true, false, true, 31, null, '休暇終了日'),
  ('approvals', 'leave_type', '休暇種別', 'select', true, false, true, 32, null, '休暇の種類'),
  ('approvals', 'leave_reason', '取得理由', 'textarea', false, true, true, 33, '休暇取得の理由を記載', '休暇取得の理由・目的'),
  ('approvals', 'emergency_contact', '緊急連絡先', 'tel', false, false, false, 34, '090-1234-5678', '休暇中の緊急連絡先');

-- 金額なし決済専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'decision_matter', '決済事項', 'text', true, true, true, 40, '○○の件について', '決済を求める事項'),
  ('approvals', 'background', '背景・経緯', 'textarea', true, true, true, 41, '経緯や背景を詳しく記載', '決済が必要になった背景'),
  ('approvals', 'expected_effect', '期待効果', 'textarea', false, true, true, 42, '期待される効果・メリット', '決済による期待効果'),
  ('approvals', 'risk_assessment', 'リスク評価', 'textarea', false, true, true, 43, 'リスクがあれば記載', '想定されるリスク・デメリット');

-- 決裁のみ専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'approval_matter', '承認事項', 'text', true, true, true, 50, '○○について承認を求めます', '承認を求める事項'),
  ('approvals', 'reference_document', '参考資料', 'text', false, false, false, 51, '添付資料参照', '関連する資料・文書'),
  ('approvals', 'approval_deadline', '承認期限', 'date', false, false, true, 52, null, '承認が必要な期限'),
  ('approvals', 'stakeholders', '関係者', 'text', false, true, true, 53, '関係部署・担当者名', '関係する部署・担当者');

-- 欠勤・遅刻・早退報告専用フィールド
INSERT INTO public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) VALUES
  ('approvals', 'absence_type', '種別', 'select', true, false, true, 60, null, '欠勤・遅刻・早退の種別'),
  ('approvals', 'absence_date', '対象日', 'date', true, false, true, 61, null, '欠勤・遅刻・早退の対象日'),
  ('approvals', 'absence_start_time', '開始時刻', 'text', false, false, false, 62, '09:00', '遅刻・早退の開始時刻'),
  ('approvals', 'absence_end_time', '終了時刻', 'text', false, false, false, 63, '17:00', '早退の終了時刻'),
  ('approvals', 'absence_reason', '理由', 'textarea', true, true, true, 64, '理由を詳しく記載', '欠勤・遅刻・早退の理由'),
  ('approvals', 'medical_certificate', '診断書', 'boolean', false, false, false, 65, null, '診断書がある場合チェック');

-- カテゴリ別のオプション設定
UPDATE public.field_definitions SET options = '[
  {"label": "経費上申", "value": "expense"},
  {"label": "交通費精算", "value": "transport"},
  {"label": "有給休暇上申", "value": "leave"},
  {"label": "金額なし決済", "value": "no_cost"},
  {"label": "決裁のみ", "value": "approval_only"},
  {"label": "欠勤・遅刻・早退報告", "value": "absence"}
]'::jsonb WHERE module_name = 'approvals' AND field_key = 'category';

-- 経費種別のオプション
UPDATE public.field_definitions SET options = '[
  {"label": "消耗品", "value": "supplies"},
  {"label": "書籍・資料", "value": "books"},
  {"label": "会議費", "value": "meeting"},
  {"label": "接待費", "value": "entertainment"},
  {"label": "通信費", "value": "communication"},
  {"label": "外注費", "value": "outsourcing"},
  {"label": "その他", "value": "other"}
]'::jsonb WHERE module_name = 'approvals' AND field_key = 'expense_category';

-- 交通手段のオプション
UPDATE public.field_definitions SET options = '[
  {"label": "電車", "value": "train"},
  {"label": "バス", "value": "bus"},
  {"label": "タクシー", "value": "taxi"},
  {"label": "飛行機", "value": "airplane"},
  {"label": "新幹線", "value": "shinkansen"},
  {"label": "自家用車", "value": "car"},
  {"label": "その他", "value": "other"}
]'::jsonb WHERE module_name = 'approvals' AND field_key = 'transport_method';

-- 休暇種別のオプション
UPDATE public.field_definitions SET options = '[
  {"label": "有給休暇", "value": "paid_leave"},
  {"label": "特別休暇", "value": "special_leave"},
  {"label": "慶弔休暇", "value": "ceremonial_leave"},
  {"label": "病気休暇", "value": "sick_leave"},
  {"label": "その他", "value": "other"}
]'::jsonb WHERE module_name = 'approvals' AND field_key = 'leave_type';

-- 欠勤種別のオプション
UPDATE public.field_definitions SET options = '[
  {"label": "欠勤", "value": "absence"},
  {"label": "遅刻", "value": "late"},
  {"label": "早退", "value": "early_leave"}
]'::jsonb WHERE module_name = 'approvals' AND field_key = 'absence_type';

-- カテゴリ別フィールド表示制御のためのカテゴリ情報追加
-- 経費上申フィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = jsonb_build_object('category', 'expense') 
WHERE module_name = 'approvals' AND field_key IN ('expense_amount', 'expense_category', 'vendor_name', 'receipt_date', 'business_purpose');

-- 交通費精算フィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = COALESCE(options, '{}'::jsonb) || jsonb_build_object('category', 'transport')
WHERE module_name = 'approvals' AND field_key IN ('transport_amount', 'departure', 'destination', 'transport_date', 'transport_method', 'round_trip');

-- 有給休暇フィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = COALESCE(options, '{}'::jsonb) || jsonb_build_object('category', 'leave')
WHERE module_name = 'approvals' AND field_key IN ('leave_start_date', 'leave_end_date', 'leave_type', 'leave_reason', 'emergency_contact');

-- 金額なし決済フィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = jsonb_build_object('category', 'no_cost')
WHERE module_name = 'approvals' AND field_key IN ('decision_matter', 'background', 'expected_effect', 'risk_assessment');

-- 決裁のみフィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = jsonb_build_object('category', 'approval_only')
WHERE module_name = 'approvals' AND field_key IN ('approval_matter', 'reference_document', 'approval_deadline', 'stakeholders');

-- 欠勤報告フィールドにカテゴリ情報追加
UPDATE public.field_definitions SET options = COALESCE(options, '{}'::jsonb) || jsonb_build_object('category', 'absence')
WHERE module_name = 'approvals' AND field_key IN ('absence_type', 'absence_date', 'absence_start_time', 'absence_end_time', 'absence_reason', 'medical_certificate');

-- Fix JSON syntax errors in field_definitions table

-- Clear existing field definitions to start fresh
DELETE FROM field_definitions WHERE module_name = 'approvals';

-- Insert corrected field definitions with proper JSONB syntax
INSERT INTO field_definitions (
  module_name, field_key, label, type, required, ai_enabled, variable_enabled, 
  options, validation, order_index, visible, description, placeholder
) VALUES
-- Common fields (no category restriction)
('approvals', 'title', 'タイトル', 'text', true, true, true, NULL, NULL, 1, true, '申請のタイトルを入力してください', '例：モニター購入申請'),
('approvals', 'description', '詳細説明', 'textarea', true, true, true, NULL, NULL, 2, true, '申請の詳細な説明を入力してください', '申請の背景、目的、詳細を記載'),

-- Application code field (common)
('approvals', 'application_code', '申請コード', 'select', true, false, false, NULL, NULL, 3, true, '該当する申請コードを選択してください', '申請コードを選択'),

-- Expense category fields
('approvals', 'amount', '金額', 'number', true, false, false, '{"category": "expense"}', NULL, 10, true, '申請金額を入力してください（円）', '120000'),
('approvals', 'expense_type', '経費種別', 'select', true, false, false, '{"category": "expense", "options": [{"value": "equipment", "label": "備品・機器"}, {"value": "software", "label": "ソフトウェア"}, {"value": "supplies", "label": "消耗品"}, {"value": "outsourcing", "label": "外注費"}, {"value": "cloud", "label": "クラウドサービス"}, {"value": "other", "label": "その他"}]}', NULL, 11, true, '経費の種別を選択してください', '経費種別を選択'),
('approvals', 'recipient_id', '支払先', 'select', true, false, false, '{"category": "expense"}', NULL, 12, true, '支払先を選択してください', '支払先を選択'),
('approvals', 'receipt_date', 'レシート日付', 'date', true, false, false, '{"category": "expense"}', NULL, 13, true, 'レシートの日付を入力してください', ''),
('approvals', 'business_purpose', '業務目的', 'textarea', true, true, false, '{"category": "expense"}', NULL, 14, true, '業務上の目的・必要性を説明してください', '業務効率化のため、開発環境改善のため等'),

-- Transport category fields
('approvals', 'transport_amount', '交通費', 'number', true, false, false, '{"category": "transport"}', NULL, 20, true, '交通費の金額を入力してください（円）', '1500'),
('approvals', 'departure', '出発地', 'text', true, false, false, '{"category": "transport"}', NULL, 21, true, '出発地を入力してください', '新宿駅'),
('approvals', 'destination', '到着地', 'text', true, false, false, '{"category": "transport"}', NULL, 22, true, '到着地を入力してください', '品川駅'),
('approvals', 'travel_date', '利用日', 'date', true, false, false, '{"category": "transport"}', NULL, 23, true, '交通機関を利用した日付を入力してください', ''),
('approvals', 'transport_method', '交通手段', 'select', true, false, false, '{"category": "transport", "options": [{"value": "train", "label": "電車"}, {"value": "bus", "label": "バス"}, {"value": "taxi", "label": "タクシー"}, {"value": "airplane", "label": "飛行機"}, {"value": "car", "label": "自家用車"}, {"value": "other", "label": "その他"}]}', NULL, 24, true, '利用した交通手段を選択してください', '交通手段を選択'),
('approvals', 'round_trip', '往復', 'boolean', false, false, false, '{"category": "transport"}', NULL, 25, true, '往復利用の場合はチェックしてください', '往復利用'),

-- Leave category fields
('approvals', 'leave_start_date', '開始日', 'date', true, false, false, '{"category": "leave"}', NULL, 30, true, '休暇開始日を入力してください', ''),
('approvals', 'leave_end_date', '終了日', 'date', true, false, false, '{"category": "leave"}', NULL, 31, true, '休暇終了日を入力してください', ''),
('approvals', 'leave_type', '休暇種別', 'select', true, false, false, '{"category": "leave", "options": [{"value": "annual", "label": "年次有給休暇"}, {"value": "sick", "label": "病気休暇"}, {"value": "special", "label": "特別休暇"}, {"value": "maternity", "label": "産前産後休暇"}, {"value": "childcare", "label": "育児休暇"}, {"value": "other", "label": "その他"}]}', NULL, 32, true, '休暇の種別を選択してください', '休暇種別を選択'),
('approvals', 'leave_reason', '取得理由', 'textarea', true, true, false, '{"category": "leave"}', NULL, 33, true, '休暇取得の理由を入力してください', '私用のため、体調不良のため等'),
('approvals', 'emergency_contact', '緊急連絡先', 'tel', false, false, false, '{"category": "leave"}', NULL, 34, true, '緊急時の連絡先を入力してください', '090-1234-5678'),

-- No cost category fields
('approvals', 'decision_matter', '決済事項', 'text', true, true, false, '{"category": "no_cost"}', NULL, 40, true, '決済が必要な事項を入力してください', '新規プロジェクト承認'),
('approvals', 'background', '背景・経緯', 'textarea', true, true, false, '{"category": "no_cost"}', NULL, 41, true, '決済に至った背景や経緯を説明してください', '市場動向の変化により...'),
('approvals', 'expected_effect', '期待効果', 'textarea', true, true, false, '{"category": "no_cost"}', NULL, 42, true, '期待される効果を説明してください', '売上向上、コスト削減等'),
('approvals', 'risk_assessment', 'リスク評価', 'textarea', false, true, false, '{"category": "no_cost"}', NULL, 43, true, '想定されるリスクがあれば記載してください', '競合他社の動向、技術的リスク等'),

-- Approval only category fields
('approvals', 'approval_matter', '承認事項', 'text', true, true, false, '{"category": "approval_only"}', NULL, 50, true, '承認が必要な事項を入力してください', '契約書承認'),
('approvals', 'reference_documents', '参考資料', 'text', false, false, false, '{"category": "approval_only"}', NULL, 51, true, '参考となる資料があれば記載してください', '契約書ドラフト、提案書等'),
('approvals', 'approval_deadline', '承認期限', 'date', false, false, false, '{"category": "approval_only"}', NULL, 52, true, '承認が必要な期限があれば入力してください', ''),
('approvals', 'stakeholders', '関係者', 'text', false, false, false, '{"category": "approval_only"}', NULL, 53, true, '関係する部署や担当者を記載してください', '営業部、法務部等'),

-- Absence category fields
('approvals', 'absence_type', '種別', 'select', true, false, false, '{"category": "absence", "options": [{"value": "absence", "label": "欠勤"}, {"value": "late", "label": "遅刻"}, {"value": "early_leave", "label": "早退"}]}', NULL, 60, true, '欠勤・遅刻・早退の種別を選択してください', '種別を選択'),
('approvals', 'target_date', '対象日', 'date', true, false, false, '{"category": "absence"}', NULL, 61, true, '欠勤・遅刻・早退の対象日を入力してください', ''),
('approvals', 'start_time', '開始時刻', 'text', false, false, false, '{"category": "absence"}', NULL, 62, true, '遅刻・早退の開始時刻を入力してください', '10:00'),
('approvals', 'end_time', '終了時刻', 'text', false, false, false, '{"category": "absence"}', NULL, 63, true, '遅刻・早退の終了時刻を入力してください', '15:00'),
('approvals', 'absence_reason', '理由', 'textarea', true, true, false, '{"category": "absence"}', NULL, 64, true, '欠勤・遅刻・早退の理由を入力してください', '体調不良のため、交通機関の遅延のため等'),
('approvals', 'medical_certificate', '診断書', 'boolean', false, false, false, '{"category": "absence"}', NULL, 65, true, '診断書がある場合はチェックしてください', '診断書あり');

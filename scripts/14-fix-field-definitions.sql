-- field_definitions テーブルにカテゴリカラムを追加（存在しない場合）
ALTER TABLE field_definitions 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 承認申請用の動的フィールド定義を更新
DELETE FROM field_definitions WHERE module_name = 'approvals';

-- 経費精算用フィールド
INSERT INTO field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, options, validation, order_index, visible, description, placeholder, category) VALUES
('approvals', 'purpose', '目的', 'text', true, true, true, null, null, 1, true, '申請の目的を入力してください', '会議費、交通費など', 'expense'),
('approvals', 'amount', '金額', 'number', true, false, true, null, '{"min": 1}', 2, true, '金額を入力してください（円）', '1000', 'expense'),
('approvals', 'receipt_date', 'レシート日付', 'date', true, false, true, null, null, 3, true, 'レシートの日付を選択してください', null, 'expense'),
('approvals', 'vendor', '支払先', 'text', false, false, true, null, null, 4, true, '支払先を入力してください', '株式会社○○', 'expense'),
('approvals', 'description', '詳細説明', 'textarea', false, true, true, null, null, 5, true, '詳細な説明を入力してください', null, 'expense');

-- 休暇申請用フィールド
INSERT INTO field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, options, validation, order_index, visible, description, placeholder, category) VALUES
('approvals', 'leave_type', '休暇種別', 'select', true, false, true, '[{"value": "annual", "label": "年次有給休暇"}, {"value": "sick", "label": "病気休暇"}, {"value": "special", "label": "特別休暇"}]', null, 1, true, '休暇の種別を選択してください', null, 'leave'),
('approvals', 'start_date', '開始日', 'date', true, false, true, null, null, 2, true, '休暇開始日を選択してください', null, 'leave'),
('approvals', 'end_date', '終了日', 'date', true, false, true, null, null, 3, true, '休暇終了日を選択してください', null, 'leave'),
('approvals', 'reason', '理由', 'textarea', false, true, true, null, null, 4, true, '休暇の理由を入力してください', null, 'leave'),
('approvals', 'emergency_contact', '緊急連絡先', 'tel', false, false, true, null, null, 5, true, '緊急時の連絡先を入力してください', '090-1234-5678', 'leave');

-- 出張申請用フィールド
INSERT INTO field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, options, validation, order_index, visible, description, placeholder, category) VALUES
('approvals', 'destination', '出張先', 'text', true, false, true, null, null, 1, true, '出張先を入力してください', '東京都、大阪府など', 'travel'),
('approvals', 'travel_start', '出張開始日', 'datetime', true, false, true, null, null, 2, true, '出張開始日時を選択してください', null, 'travel'),
('approvals', 'travel_end', '出張終了日', 'datetime', true, false, true, null, null, 3, true, '出張終了日時を選択してください', null, 'travel'),
('approvals', 'estimated_cost', '概算費用', 'number', false, false, true, null, '{"min": 0}', 4, true, '概算費用を入力してください（円）', '50000', 'travel'),
('approvals', 'travel_purpose', '出張目的', 'textarea', true, true, true, null, null, 5, true, '出張の目的を詳しく入力してください', null, 'travel');

-- 購入申請用フィールド
INSERT INTO field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, options, validation, order_index, visible, description, placeholder, category) VALUES
('approvals', 'item_name', '購入品名', 'text', true, false, true, null, null, 1, true, '購入する商品名を入力してください', 'ノートPC、プリンターなど', 'purchase'),
('approvals', 'quantity', '数量', 'number', true, false, true, null, '{"min": 1}', 2, true, '購入数量を入力してください', '1', 'purchase'),
('approvals', 'unit_price', '単価', 'number', true, false, true, null, '{"min": 1}', 3, true, '単価を入力してください（円）', '100000', 'purchase'),
('approvals', 'supplier', '仕入先', 'text', false, false, true, null, null, 4, true, '仕入先を入力してください', 'Amazon、ヨドバシカメラなど', 'purchase'),
('approvals', 'justification', '購入理由', 'textarea', true, true, true, null, null, 5, true, '購入が必要な理由を詳しく入力してください', null, 'purchase');

-- その他申請用フィールド
INSERT INTO field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, options, validation, order_index, visible, description, placeholder, category) VALUES
('approvals', 'request_type', '申請種別', 'text', true, false, true, null, null, 1, true, '申請の種別を入力してください', '設備利用、会議室予約など', 'other'),
('approvals', 'details', '詳細内容', 'textarea', true, true, true, null, null, 2, true, '申請内容を詳しく入力してください', null, 'other'),
('approvals', 'preferred_date', '希望日', 'date', false, false, true, null, null, 3, true, '希望日があれば選択してください', null, 'other'),
('approvals', 'priority', '優先度', 'select', false, false, true, '[{"value": "low", "label": "低"}, {"value": "medium", "label": "中"}, {"value": "high", "label": "高"}]', null, 4, true, '優先度を選択してください', null, 'other');

-- Insert field definitions for all modules

-- Leads module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('leads', 'name', '担当者名', 'text', true, true, true, 1, '山田太郎', '顧客の担当者名'),
  ('leads', 'company_name', '会社名', 'text', false, true, true, 2, '株式会社サンプル', '顧客の会社名'),
  ('leads', 'status', 'ステータス', 'select', true, true, true, 3, null, 'リードの進捗状況'),
  ('leads', 'contact_email', 'メールアドレス', 'email', false, true, false, 4, 'example@company.com', '連絡用メールアドレス'),
  ('leads', 'contact_phone', '電話番号', 'tel', false, true, false, 5, '03-1234-5678', '連絡用電話番号'),
  ('leads', 'notes', '備考', 'textarea', false, true, false, 6, '備考を入力してください', '追加情報や特記事項'),
  ('leads', 'assigned_to', '担当者', 'select', false, true, true, 7, null, 'アサインされた担当者');

-- Update leads status options
update public.field_definitions set options = '[
  {"label": "新規", "value": "new"},
  {"label": "連絡済み", "value": "contacted"},
  {"label": "見込み", "value": "qualified"},
  {"label": "失注", "value": "lost"}
]'::jsonb where module_name = 'leads' and field_key = 'status';

-- Tasks module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('tasks', 'title', 'タスク名', 'text', true, true, true, 1, 'タスク名を入力', 'タスクの名称'),
  ('tasks', 'status', 'ステータス', 'select', true, true, true, 2, null, 'タスクの進捗状況'),
  ('tasks', 'due_date', '期限日', 'date', false, true, true, 3, null, 'タスクの完了期限'),
  ('tasks', 'priority', '優先度', 'select', false, true, true, 4, null, 'タスクの重要度'),
  ('tasks', 'notes', '備考', 'textarea', false, true, false, 5, '備考を入力してください', '詳細説明や補足情報'),
  ('tasks', 'report_id', '関連日報', 'select', false, false, false, 6, null, '関連する日報');

-- Update tasks options
update public.field_definitions set options = '[
  {"label": "未着手", "value": "todo"},
  {"label": "進行中", "value": "in_progress"},
  {"label": "完了", "value": "done"}
]'::jsonb where module_name = 'tasks' and field_key = 'status';

update public.field_definitions set options = '[
  {"label": "高", "value": "high"},
  {"label": "中", "value": "medium"},
  {"label": "低", "value": "low"}
]'::jsonb where module_name = 'tasks' and field_key = 'priority';

-- Approvals module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('approvals', 'category', 'カテゴリ', 'select', true, true, true, 1, null, '申請の種類'),
  ('approvals', 'purpose', '目的', 'text', true, true, true, 2, '申請の目的を入力', '申請の目的・理由'),
  ('approvals', 'amount', '金額', 'number', false, true, true, 3, '0', '申請金額'),
  ('approvals', 'destination', '行き先・場所', 'text', false, true, true, 4, '行き先や場所を入力', '出張先や会議場所'),
  ('approvals', 'date', '日付', 'date', false, true, true, 5, null, '申請対象日'),
  ('approvals', 'description', '詳細説明', 'textarea', false, true, false, 6, '詳細な説明を入力してください', '申請の詳細内容'),
  ('approvals', 'status', 'ステータス', 'select', true, false, true, 7, null, '承認状況');

-- Update approvals options
update public.field_definitions set options = '[
  {"label": "経費精算", "value": "expense"},
  {"label": "休暇申請", "value": "leave"},
  {"label": "出張申請", "value": "travel"},
  {"label": "購入申請", "value": "purchase"},
  {"label": "その他", "value": "other"}
]'::jsonb where module_name = 'approvals' and field_key = 'category';

update public.field_definitions set options = '[
  {"label": "承認待ち", "value": "pending"},
  {"label": "承認済み", "value": "approved"},
  {"label": "却下", "value": "rejected"}
]'::jsonb where module_name = 'approvals' and field_key = 'status';

-- Users module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('users', 'employee_id', '従業員ID', 'text', true, false, true, 1, 'EMP001', '従業員識別番号'),
  ('users', 'name', '名前', 'text', true, true, true, 2, '山田太郎', '従業員の氏名'),
  ('users', 'email', 'メールアドレス', 'email', true, false, true, 3, 'yamada@company.com', 'ログイン用メールアドレス'),
  ('users', 'role', '役割', 'select', true, true, true, 4, null, 'システム内での権限'),
  ('users', 'status', 'ステータス', 'select', true, false, true, 5, null, 'アカウントの有効状態');

-- Update users options
update public.field_definitions set options = '[
  {"label": "管理者", "value": "admin"},
  {"label": "ユーザー", "value": "user"}
]'::jsonb where module_name = 'users' and field_key = 'role';

update public.field_definitions set options = '[
  {"label": "有効", "value": "active"},
  {"label": "無効", "value": "inactive"}
]'::jsonb where module_name = 'users' and field_key = 'status';

-- Payment Recipients module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('payment_recipients', 'recipient_name', '受取人名', 'text', true, true, true, 1, '株式会社サンプル', '支払先の名称'),
  ('payment_recipients', 'bank_name', '銀行名', 'text', false, true, true, 2, 'みずほ銀行', '振込先銀行名'),
  ('payment_recipients', 'branch_name', '支店名', 'text', false, true, true, 3, '新宿支店', '振込先支店名'),
  ('payment_recipients', 'account_type', '口座種別', 'select', false, false, false, 4, null, '普通・当座の区別'),
  ('payment_recipients', 'account_number', '口座番号', 'text', false, false, false, 5, '1234567', '振込先口座番号'),
  ('payment_recipients', 'account_holder', '口座名義', 'text', false, false, false, 6, 'カ）サンプル', '口座の名義人'),
  ('payment_recipients', 'phone', '電話番号', 'tel', false, true, false, 7, '03-1234-5678', '連絡用電話番号'),
  ('payment_recipients', 'email', 'メールアドレス', 'email', false, true, false, 8, 'contact@example.com', '連絡用メールアドレス');

-- Update payment recipients options
update public.field_definitions set options = '[
  {"label": "普通", "value": "ordinary"},
  {"label": "当座", "value": "checking"}
]'::jsonb where module_name = 'payment_recipients' and field_key = 'account_type';

-- Application Codes module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('application_codes', 'code', 'コード', 'text', true, true, true, 1, 'EXP_TRAVEL', 'システム内識別コード'),
  ('application_codes', 'label', 'ラベル', 'text', true, true, true, 2, '出張費', '表示用ラベル'),
  ('application_codes', 'category', 'カテゴリ', 'select', true, true, true, 3, null, 'コードの分類'),
  ('application_codes', 'description', '説明', 'textarea', false, true, false, 4, 'コードの詳細な説明を入力してください', 'コードの詳細説明'),
  ('application_codes', 'is_active', '有効状態', 'boolean', false, false, true, 5, null, 'コードの使用可否');

-- Update application codes options
update public.field_definitions set options = '[
  {"label": "経費カテゴリ", "value": "expense_category"},
  {"label": "タスク種別", "value": "task_type"},
  {"label": "承認種別", "value": "approval_type"},
  {"label": "文書種別", "value": "document_type"},
  {"label": "優先度レベル", "value": "priority_level"},
  {"label": "ステータス種別", "value": "status_type"},
  {"label": "部署", "value": "department"},
  {"label": "その他", "value": "other"}
]'::jsonb where module_name = 'application_codes' and field_key = 'category';

-- Nextcloud Files module
insert into public.field_definitions (module_name, field_key, label, type, required, ai_enabled, variable_enabled, order_index, placeholder, description) values
  ('nextcloud_files', 'linked_type', '関連タイプ', 'select', true, false, true, 1, null, 'ファイルの関連先'),
  ('nextcloud_files', 'linked_id', '関連ID', 'text', true, false, false, 2, null, '関連エンティティのID'),
  ('nextcloud_files', 'file_name', 'ファイル名', 'text', true, true, true, 3, 'document.pdf', 'アップロードファイル名'),
  ('nextcloud_files', 'mime_type', 'MIMEタイプ', 'text', false, false, false, 4, 'application/pdf', 'ファイルの種類'),
  ('nextcloud_files', 'file_path', 'ファイルパス', 'text', true, false, false, 5, '/uploads/...', 'サーバー上のパス');

-- Update nextcloud files options
update public.field_definitions set options = '[
  {"label": "承認申請", "value": "approval"},
  {"label": "日報", "value": "report"},
  {"label": "リード", "value": "lead"},
  {"label": "タスク", "value": "task"}
]'::jsonb where module_name = 'nextcloud_files' and field_key = 'linked_type';

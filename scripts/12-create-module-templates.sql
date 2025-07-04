-- Create module templates table
create table public.module_templates (
  id uuid primary key default gen_random_uuid(),
  module_name text not null,
  name text not null,
  template_type text not null check (template_type in ('ai_prompt', 'slack', 'email', 'sms', 'pdf', 'custom')),
  content text not null,
  description text,
  is_active boolean default true,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(module_name, name, template_type)
);

-- Create indexes
create index idx_module_templates_module on public.module_templates(module_name);
create index idx_module_templates_type on public.module_templates(template_type);
create index idx_module_templates_active on public.module_templates(is_active) where is_active = true;

-- Insert default templates
insert into public.module_templates (module_name, name, template_type, content, description) values
  -- Leads templates
  ('leads', 'デフォルト要約', 'ai_prompt', '以下のリード情報を要約してください：\n\n会社名: {{company_name}}\n担当者: {{name}}\nステータス: {{status}}\nメール: {{contact_email}}\n電話: {{contact_phone}}\n備考: {{notes}}', 'リード情報の標準AI要約テンプレート'),
  ('leads', 'Slack通知', 'slack', '🎯 新しいリード: {{company_name}} - {{name}}\nステータス: {{status}}\n担当者: {{assigned_to}}\n📧 {{contact_email}}\n📞 {{contact_phone}}', 'Slack用リード通知テンプレート'),
  ('leads', 'フォローアップメール', 'email', '件名: フォローアップ - {{company_name}}\n\n{{name}}様\n\nお世話になっております。\n{{company_name}}の件でご連絡いたします。\n\n現在のステータス: {{status}}\n\n{{notes}}\n\nご不明な点がございましたらお気軽にお声がけください。', 'リードフォローアップ用メールテンプレート'),
  
  -- Tasks templates  
  ('tasks', 'タスク分析', 'ai_prompt', '以下のタスク情報を分析し、改善点や注意点を提案してください：\n\nタスク名: {{title}}\nステータス: {{status}}\n期限: {{due_date}}\n優先度: {{priority}}\n備考: {{notes}}', 'タスク分析用AIプロンプト'),
  ('tasks', 'タスク更新通知', 'slack', '📋 タスク更新: {{title}}\n📊 ステータス: {{status}}\n📅 期限: {{due_date}}\n🔥 優先度: {{priority}}', 'Slack用タスク更新通知'),
  ('tasks', 'タスク完了報告', 'email', '件名: タスク完了報告 - {{title}}\n\nタスクが完了しました。\n\nタスク名: {{title}}\n完了日: {{due_date}}\n優先度: {{priority}}\n\n作業内容:\n{{notes}}', 'タスク完了報告メール'),
  
  -- Approvals templates
  ('approvals', '承認依頼', 'ai_prompt', '以下の承認申請について、承認可否の判断材料を整理してください：\n\nカテゴリ: {{category}}\n目的: {{purpose}}\n金額: {{amount}}円\n日付: {{date}}\n行き先: {{destination}}\n詳細: {{description}}', '承認判断支援AIプロンプト'),
  ('approvals', '承認通知', 'slack', '📝 承認申請: {{category}}\n💰 金額: {{amount}}円\n📍 {{destination}}\n📅 {{date}}\n✅ 承認をお願いします', 'Slack用承認依頼通知'),
  ('approvals', '承認完了メール', 'email', '件名: 承認完了 - {{category}}\n\nご申請いただいた件について承認いたします。\n\n申請内容:\nカテゴリ: {{category}}\n目的: {{purpose}}\n金額: {{amount}}円\n日付: {{date}}\n\n承認日: 本日\n\n手続きを進めてください。', '承認完了通知メール');

-- Enable RLS
alter table public.module_templates enable row level security;

-- Create policies
create policy "Users can view templates" on public.module_templates for select using (true);
create policy "Admins can manage templates" on public.module_templates for all using (
  exists (
    select 1 from public.users 
    where id::text = auth.uid()::text and role = 'admin'
  )
);

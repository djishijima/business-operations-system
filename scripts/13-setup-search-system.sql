-- Enable full-text search extensions
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- Create search configuration for Japanese
create text search configuration japanese (copy = simple);

-- Create unified search view
create or replace view public.unified_search_view as
select 
  'leads' as table_name,
  id,
  name as title,
  company_name as subtitle,
  notes as content,
  status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(name, '') || ' ' || coalesce(company_name, '') || ' ' || coalesce(notes, '')) as search_vector
from public.leads
union all
select 
  'tasks' as table_name,
  id,
  title,
  null as subtitle,
  notes as content,
  status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(title, '') || ' ' || coalesce(notes, '')) as search_vector
from public.tasks
union all
select 
  'approvals' as table_name,
  id,
  (form->>'purpose') as title,
  category as subtitle,
  (form->>'description') as content,
  status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(form->>'purpose', '') || ' ' || coalesce(category, '') || ' ' || coalesce(form->>'description', '')) as search_vector
from public.approvals
union all
select 
  'users' as table_name,
  id,
  name as title,
  email as subtitle,
  null as content,
  status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(name, '') || ' ' || coalesce(email, '')) as search_vector
from public.users
union all
select 
  'payment_recipients' as table_name,
  id,
  recipient_name as title,
  bank_name as subtitle,
  null as content,
  'active' as status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(recipient_name, '') || ' ' || coalesce(bank_name, '')) as search_vector
from public.payment_recipients
union all
select 
  'application_codes' as table_name,
  id,
  label as title,
  category as subtitle,
  description as content,
  case when is_active then 'active' else 'inactive' end as status,
  created_at,
  updated_at,
  to_tsvector('japanese', coalesce(label, '') || ' ' || coalesce(category, '') || ' ' || coalesce(description, '')) as search_vector
from public.application_codes;

-- Create search index
create index if not exists idx_unified_search_vector on public.unified_search_view using gin(search_vector);
create index if not exists idx_unified_search_table on public.unified_search_view(table_name);
create index if not exists idx_unified_search_created on public.unified_search_view(created_at desc);

-- Create search history table
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  query text not null,
  table_filter text,
  results_count integer,
  search_type text check (search_type in ('fulltext', 'vector', 'ai')),
  created_at timestamptz default now()
);

-- Create search analytics view
create or replace view public.search_analytics as
select 
  date_trunc('day', created_at) as search_date,
  search_type,
  count(*) as search_count,
  count(distinct user_id) as unique_users,
  avg(results_count) as avg_results
from public.search_history
group by date_trunc('day', created_at), search_type
order by search_date desc;

-- Enable RLS
alter table public.search_history enable row level security;

-- Create policies
create policy "Users can view their own search history" on public.search_history for select using (auth.uid()::text = user_id::text);
create policy "Users can insert their own search history" on public.search_history for insert with check (auth.uid()::text = user_id::text);

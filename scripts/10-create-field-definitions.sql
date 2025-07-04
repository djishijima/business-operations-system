-- Create field definitions table for dynamic CMS
create table public.field_definitions (
  id uuid primary key default gen_random_uuid(),
  module_name text not null,
  field_key text not null,
  label text not null,
  type text not null check (type in ('text', 'textarea', 'number', 'date', 'datetime', 'select', 'boolean', 'file', 'email', 'tel', 'url')),
  required boolean default false,
  ai_enabled boolean default false,
  variable_enabled boolean default false,
  options jsonb,
  validation jsonb,
  order_index integer default 0,
  visible boolean default true,
  description text,
  placeholder text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(module_name, field_key)
);

-- Create indexes for performance
create index idx_field_definitions_module on public.field_definitions(module_name);
create index idx_field_definitions_ai_enabled on public.field_definitions(ai_enabled) where ai_enabled = true;
create index idx_field_definitions_variable_enabled on public.field_definitions(variable_enabled) where variable_enabled = true;

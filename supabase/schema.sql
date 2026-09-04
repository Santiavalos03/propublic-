-- ProPublic Sistema Integral
-- PostgreSQL / Supabase
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','seller','designer','production');
create type public.record_status as enum ('active','inactive');
create type public.quote_status as enum ('draft','sent','approval','change_requested','approved','rejected','expired');
create type public.payment_status as enum ('unpaid','deposit','partial','paid','pending','void');
create type public.order_status as enum ('pending','design','design_approval','production','quality_control','ready','delivered','cancelled','rework');
create type public.priority_level as enum ('normal','high','urgent','very_urgent');

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role unique not null,
  description text
);

insert into public.roles(name,description) values
('admin','Acceso total'),
('seller','Ventas y cartera propia'),
('designer','Diseño y marketing'),
('production','Taller y producción')
on conflict (name) do nothing;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  phone text unique,
  full_name text not null,
  role public.app_role not null default 'seller',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Capital One Corporaciones E.A.S.',
  brand_name text not null default 'ProPublic',
  legal_id text,
  phone text,
  email text,
  address text,
  logo_path text,
  letterhead_path text,
  iva_rate numeric(5,2) not null default 10.00,
  quote_terms text,
  quote_prefix text not null default 'PP-PRES',
  sale_prefix text not null default 'PP-VENT',
  order_prefix text not null default 'PP-PED',
  client_prefix text not null default 'PP-CLI',
  product_prefix text not null default 'PP-ART',
  updated_at timestamptz not null default now()
);

insert into public.company_settings default values;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  company_name text,
  tax_id text,
  national_id text,
  responsible_first_name text,
  responsible_last_name text,
  position text,
  phone_1 text,
  phone_2 text,
  email_1 text,
  email_2 text,
  email_3 text,
  email_4 text,
  address text,
  city text,
  notes text,
  status public.record_status not null default 'active',
  seller_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_seller_idx on public.clients(seller_id);
create index clients_search_idx on public.clients(company_name,tax_id,national_id,code);

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  client_id uuid references public.clients(id) on delete cascade,
  percentage numeric(7,2) not null check (percentage >= 0 and percentage <= 100),
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  max_uses integer,
  uses_count integer not null default 0,
  active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.discount_products (
  discount_code_id uuid references public.discount_codes(id) on delete cascade,
  product_id uuid,
  primary key(discount_code_id, product_id)
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category_id uuid references public.product_categories(id),
  photo_path text,
  description text,
  measurements text,
  material text,
  unit text not null default 'unidad',
  stock numeric,
  active boolean not null default true,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null check(min_quantity > 0),
  unit_price numeric(14,2) not null check(unit_price >= 0),
  created_at timestamptz not null default now(),
  unique(product_id,min_quantity)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  public_token text unique not null default encode(gen_random_bytes(24),'hex'),
  client_id uuid references public.clients(id),
  seller_id uuid not null references public.profiles(id),
  status public.quote_status not null default 'draft',
  quote_date date not null default current_date,
  expires_at date,
  subtotal numeric(14,2) not null default 0,
  iva_rate numeric(5,2) not null default 10,
  iva_amount numeric(14,2) not null default 0,
  discount_percentage numeric(7,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  observations text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id),
  product_code text,
  description text not null,
  quantity numeric(14,2) not null check(quantity > 0),
  measurements text,
  unit_price numeric(14,2) not null,
  line_total numeric(14,2) not null,
  observations text,
  manual boolean not null default false
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  quote_id uuid unique references public.quotes(id),
  client_id uuid references public.clients(id),
  seller_id uuid not null references public.profiles(id),
  payment_status public.payment_status not null default 'unpaid',
  subtotal numeric(14,2) not null default 0,
  iva_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric(14,2) not null,
  unit_price numeric(14,2) not null,
  line_total numeric(14,2) not null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  amount numeric(14,2) not null check(amount > 0),
  paid_at timestamptz not null default now(),
  method text not null check(method in ('cash','transfer','card','qr','other')),
  notes text,
  recorded_by uuid not null references public.profiles(id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  sale_id uuid unique references public.sales(id),
  client_id uuid references public.clients(id),
  seller_id uuid not null references public.profiles(id),
  status public.order_status not null default 'pending',
  priority public.priority_level not null default 'normal',
  due_date date,
  due_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric(14,2) not null,
  measurements text,
  material text,
  finish text,
  instructions text
);

create table public.design_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  status text not null default 'pending',
  client_brief text,
  deadline timestamptz,
  urgent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.design_versions (
  id uuid primary key default gen_random_uuid(),
  design_job_id uuid not null references public.design_jobs(id) on delete cascade,
  version_no integer not null,
  file_path text not null,
  comments text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(design_job_id,version_no)
);

create table public.production_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  status text not null default 'pending',
  instructions text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_updates (
  id uuid primary key default gen_random_uuid(),
  production_job_id uuid not null references public.production_jobs(id) on delete cascade,
  status text not null,
  notes text,
  photo_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.reworks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  code text unique not null,
  reason text not null,
  responsible_id uuid references public.profiles(id),
  description text,
  new_due_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  design_version_id uuid references public.design_versions(id) on delete cascade,
  bucket text not null,
  path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_amount numeric(14,2) not null default 0,
  declared_amount numeric(14,2),
  difference numeric(14,2),
  status text not null default 'open' check(status in ('open','closed'))
);

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.cash_registers(id) on delete cascade,
  payment_id uuid references public.payments(id),
  type text not null check(type in ('sale_collection','withdrawal','adjustment')),
  method text not null,
  amount numeric(14,2) not null,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  module text not null,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Number generators
create or replace function public.next_number(prefix text, target_year int default extract(year from now())::int)
returns text language plpgsql as $$
declare n bigint;
begin
  if prefix = 'PP-CLI' then
    select coalesce(max((regexp_match(code,'([0-9]+)$'))[1]::bigint),0)+1 into n from clients where code like prefix||'-%';
  elsif prefix = 'PP-ART' then
    select coalesce(max((regexp_match(code,'([0-9]+)$'))[1]::bigint),0)+1 into n from products where code like prefix||'-%';
  elsif prefix = 'PP-PRES' then
    select coalesce(max((regexp_match(number,'([0-9]+)$'))[1]::bigint),0)+1 into n from quotes where number like prefix||'-'||target_year||'-%';
    return prefix||'-'||target_year||'-'||lpad(n::text,6,'0');
  elsif prefix = 'PP-VENT' then
    select coalesce(max((regexp_match(number,'([0-9]+)$'))[1]::bigint),0)+1 into n from sales where number like prefix||'-'||target_year||'-%';
    return prefix||'-'||target_year||'-'||lpad(n::text,6,'0');
  elsif prefix = 'PP-PED' then
    select coalesce(max((regexp_match(number,'([0-9]+)$'))[1]::bigint),0)+1 into n from orders where number like prefix||'-'||target_year||'-%';
    return prefix||'-'||target_year||'-'||lpad(n::text,6,'0');
  end if;
  return prefix||'-'||lpad(n::text,6,'0');
end $$;

-- Auth profile trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,phone,full_name)
  values(new.id, coalesce(new.email,''), new.phone, coalesce(new.raw_user_meta_data->>'full_name','Usuario'));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and status='active');
$$;

create or replace function public.my_role()
returns public.app_role language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid();
$$;

-- RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table discount_codes enable row level security;
alter table discount_products enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table product_prices enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table payments enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table design_jobs enable row level security;
alter table design_versions enable row level security;
alter table production_jobs enable row level security;
alter table production_updates enable row level security;
alter table reworks enable row level security;
alter table files enable row level security;
alter table cash_registers enable row level security;
alter table cash_movements enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table company_settings enable row level security;

create policy "profiles own or admin" on profiles for select using (id=auth.uid() or public.is_admin());
create policy "admin profiles write" on profiles for all using(public.is_admin()) with check(public.is_admin());

create policy "clients own or admin" on clients for select using(public.is_admin() or seller_id=auth.uid());
create policy "clients seller create" on clients for insert with check(public.is_admin() or seller_id=auth.uid());
create policy "clients own update" on clients for update using(public.is_admin() or seller_id=auth.uid()) with check(public.is_admin() or seller_id=auth.uid());
create policy "admin clients delete" on clients for delete using(public.is_admin());

create policy "products readable" on products for select using(active=true or public.is_admin());
create policy "admin products write" on products for all using(public.is_admin()) with check(public.is_admin());
create policy "categories readable" on product_categories for select using(active=true or public.is_admin());
create policy "admin categories write" on product_categories for all using(public.is_admin()) with check(public.is_admin());
create policy "prices readable" on product_prices for select using(true);
create policy "admin prices write" on product_prices for all using(public.is_admin()) with check(public.is_admin());

create policy "discount admin or seller read" on discount_codes for select using(public.is_admin() or exists(select 1 from clients c where c.id=client_id and c.seller_id=auth.uid()));
create policy "discount admin write" on discount_codes for all using(public.is_admin()) with check(public.is_admin());
create policy "discount products admin" on discount_products for all using(public.is_admin()) with check(public.is_admin());

create policy "quotes seller scope" on quotes for select using(public.is_admin() or seller_id=auth.uid());
create policy "quotes seller create" on quotes for insert with check(public.is_admin() or seller_id=auth.uid());
create policy "quotes seller update" on quotes for update using(public.is_admin() or seller_id=auth.uid()) with check(public.is_admin() or seller_id=auth.uid());
create policy "quotes admin delete" on quotes for delete using(public.is_admin());
create policy "quote items scope" on quote_items for select using(exists(select 1 from quotes q where q.id=quote_id and (q.seller_id=auth.uid() or public.is_admin())));
create policy "quote items write" on quote_items for all using(exists(select 1 from quotes q where q.id=quote_id and (q.seller_id=auth.uid() or public.is_admin()))) with check(exists(select 1 from quotes q where q.id=quote_id and (q.seller_id=auth.uid() or public.is_admin())));

create policy "sales scope" on sales for select using(public.is_admin() or seller_id=auth.uid());
create policy "sales seller create" on sales for insert with check(public.is_admin() or seller_id=auth.uid());
create policy "sales seller update" on sales for update using(public.is_admin() or seller_id=auth.uid()) with check(public.is_admin() or seller_id=auth.uid());
create policy "sale items scope" on sale_items for all using(exists(select 1 from sales s where s.id=sale_id and (s.seller_id=auth.uid() or public.is_admin()))) with check(exists(select 1 from sales s where s.id=sale_id and (s.seller_id=auth.uid() or public.is_admin())));

create policy "payments seller/admin read" on payments for select using(public.is_admin() or exists(select 1 from sales s where s.id=sale_id and s.seller_id=auth.uid()));
create policy "payments seller/admin insert" on payments for insert with check(public.is_admin() or exists(select 1 from sales s where s.id=sale_id and s.seller_id=auth.uid()));
create policy "payments admin update" on payments for update using(public.is_admin()) with check(public.is_admin());

create policy "orders seller/admin" on orders for select using(public.is_admin() or seller_id=auth.uid() or public.my_role() in ('designer','production'));
create policy "orders seller create" on orders for insert with check(public.is_admin() or seller_id=auth.uid());
create policy "orders update scoped" on orders for update using(public.is_admin() or seller_id=auth.uid() or public.my_role() in ('designer','production')) with check(public.is_admin() or seller_id=auth.uid() or public.my_role() in ('designer','production'));
create policy "order items scoped" on order_items for all using(exists(select 1 from orders o where o.id=order_id and (o.seller_id=auth.uid() or public.is_admin() or public.my_role() in ('designer','production')))) with check(exists(select 1 from orders o where o.id=order_id and (o.seller_id=auth.uid() or public.is_admin() or public.my_role() in ('designer','production'))));

create policy "design role access" on design_jobs for all using(public.is_admin() or assigned_to=auth.uid() or public.my_role() in ('seller','designer')) with check(public.is_admin() or assigned_to=auth.uid() or public.my_role() in ('seller','designer'));
create policy "design versions access" on design_versions for all using(public.is_admin() or created_by=auth.uid() or public.my_role() in ('seller','designer')) with check(public.is_admin() or created_by=auth.uid() or public.my_role() in ('seller','designer'));

create policy "production access" on production_jobs for all using(public.is_admin() or assigned_to=auth.uid() or public.my_role() in ('seller','production')) with check(public.is_admin() or assigned_to=auth.uid() or public.my_role() in ('seller','production'));
create policy "production updates access" on production_updates for all using(public.is_admin() or created_by=auth.uid() or public.my_role() in ('seller','production')) with check(public.is_admin() or created_by=auth.uid() or public.my_role() in ('seller','production'));

create policy "reworks scoped" on reworks for all using(public.is_admin() or public.my_role() in ('seller','designer','production')) with check(public.is_admin() or public.my_role() in ('seller','designer','production'));
create policy "files scoped" on files for all using(public.is_admin() or uploaded_by=auth.uid() or public.my_role() in ('seller','designer','production')) with check(public.is_admin() or uploaded_by=auth.uid() or public.my_role() in ('seller','designer','production'));

create policy "cash own/admin" on cash_registers for all using(public.is_admin() or seller_id=auth.uid()) with check(public.is_admin() or seller_id=auth.uid());
create policy "cash movements own/admin" on cash_movements for all using(public.is_admin() or created_by=auth.uid()) with check(public.is_admin() or created_by=auth.uid());

create policy "audit admin/read own" on audit_logs for select using(public.is_admin() or actor_id=auth.uid());
create policy "audit insert auth" on audit_logs for insert with check(auth.uid()=actor_id or public.is_admin());

create policy "notifications own" on notifications for select using(recipient_id=auth.uid() or public.is_admin());
create policy "notifications own update" on notifications for update using(recipient_id=auth.uid() or public.is_admin()) with check(recipient_id=auth.uid() or public.is_admin());

create policy "settings readable auth" on company_settings for select using(auth.uid() is not null);
create policy "settings admin write" on company_settings for all using(public.is_admin()) with check(public.is_admin());

-- Realtime
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.design_jobs;
alter publication supabase_realtime add table public.production_jobs;

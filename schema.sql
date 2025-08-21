create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text check (role in ('TENANT','ADMIN')) not null default 'TENANT',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  created_at timestamptz not null default now()
);
alter table public.properties enable row level security;

create table if not exists public.tenancies (
  id uuid primary key default uuid_generate_v4(),
  tenant_user_id uuid not null references auth.users(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  rent_amount numeric(12,2) not null,
  rent_due_day int not null check (rent_due_day between 1 and 31),
  occupants int not null default 1 check (occupants >= 1),
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.tenancies enable row level security;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('PENDING','MARKED_PAID','APPROVED','LATE');
  end if;
end $$;

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  due_date date not null,
  amount numeric(12,2) not null,
  status payment_status not null default 'PENDING',
  marked_at timestamptz,
  paid_at timestamptz,
  note text,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments enable row level security;

create index if not exists payments_tenancy_due_idx on public.payments(tenancy_id, due_date);

do $$ begin
  if not exists (select 1 from pg_type where typname = 'inspection_status') then
    create type inspection_status as enum ('SCHEDULED','SUBMITTED','REVIEWED');
  end if;
end $$;

create table if not exists public.inspections (
  id uuid primary key default uuid_generate_v4(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  scheduled_date date not null,
  status inspection_status not null default 'SCHEDULED',
  created_at timestamptz not null default now()
);
alter table public.inspections enable row level security;

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists payments_set_updated on public.payments;
create trigger payments_set_updated before update on public.payments for each row execute function public.set_updated_at();

-- simple admin check
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='ADMIN');
$$;

-- Policies
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (id = auth.uid());

drop policy if exists properties_admin_all on public.properties;
create policy properties_admin_all on public.properties for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists properties_tenant_read on public.properties;
create policy properties_tenant_read on public.properties for select using (exists(
  select 1 from public.tenancies t where t.property_id = properties.id and t.tenant_user_id = auth.uid()
));

drop policy if exists tenancies_admin_all on public.tenancies;
create policy tenancies_admin_all on public.tenancies for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists tenancies_tenant_read on public.tenancies;
create policy tenancies_tenant_read on public.tenancies for select using (tenant_user_id = auth.uid());

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all on public.payments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists payments_tenant_read on public.payments;
create policy payments_tenant_read on public.payments for select using (exists(
  select 1 from public.tenancies t where t.id = payments.tenancy_id and t.tenant_user_id = auth.uid()
));
drop policy if exists payments_tenant_mark_paid on public.payments;
create policy payments_tenant_mark_paid on public.payments
  for update using (exists(select 1 from public.tenancies t where t.id = payments.tenancy_id and t.tenant_user_id = auth.uid()))
  with check (status in ('PENDING','MARKED_PAID'));

drop policy if exists inspections_admin_all on public.inspections;
create policy inspections_admin_all on public.inspections for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists inspections_tenant_read on public.inspections;
create policy inspections_tenant_read on public.inspections for select using (exists(
  select 1 from public.tenancies t where t.id = inspections.tenancy_id and t.tenant_user_id = auth.uid()
));

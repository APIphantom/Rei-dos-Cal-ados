-- Tags em produtos, bucket de imagens e pedidos (dashboard admin)

-- Coluna tags
alter table public.products
  add column if not exists tags text[] not null default '{}';

create index if not exists products_tags_gin_idx on public.products using gin (tags);

-- Pedidos (visão admin / futuro checkout)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'Pago',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select"
  on public.orders for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "orders_admin_insert" on public.orders;
create policy "orders_admin_insert"
  on public.orders for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

-- Storage: bucket público para leitura
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Políticas de storage (bucket product-images)
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin insert product images" on storage.objects;
create policy "Admin insert product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

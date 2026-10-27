-- Promoções publicadas na Home, editáveis no painel.
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  offer_type text not null default 'campaign' check (offer_type in ('campaign', 'kit')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  short_text text not null check (char_length(btrim(short_text)) between 1 and 240),
  commercial_text text,
  image_url text not null,
  image_alt text not null default '',
  product_id uuid references public.products(id) on delete set null,
  cta_label text not null default 'Ver catálogo',
  cta_href text not null default '/#catalogo',
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists promotions_active_order_idx
  on public.promotions (is_active, sort_order asc, created_at desc);

alter table public.promotions enable row level security;

grant select on public.promotions to anon, authenticated;
grant insert, update, delete on public.promotions to authenticated;

drop policy if exists "promotions_public_active_read" on public.promotions;
create policy "promotions_public_active_read"
  on public.promotions for select
  to anon, authenticated
  using (is_active);

drop policy if exists "promotions_admin_read" on public.promotions;
create policy "promotions_admin_read"
  on public.promotions for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN')
  );

drop policy if exists "promotions_admin_insert" on public.promotions;
create policy "promotions_admin_insert"
  on public.promotions for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN')
  );

drop policy if exists "promotions_admin_update" on public.promotions;
create policy "promotions_admin_update"
  on public.promotions for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN')
  );

drop policy if exists "promotions_admin_delete" on public.promotions;
create policy "promotions_admin_delete"
  on public.promotions for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN')
  );

-- Oferta explicitamente fornecida pela loja. A imagem vem do produto em destaque,
-- sem gravar um UUID gerado previamente no arquivo de migração.
insert into public.promotions (
  offer_type, title, short_text, image_url, image_alt, product_id,
  cta_label, cta_href, is_active, sort_order
)
select
  'campaign',
  'Na compra de dois tênis',
  'O terceiro sai por R$ 50.',
  p.image_url,
  p.name,
  p.id,
  'Ver catálogo',
  '/#catalogo',
  true,
  0
from public.products p
where p.is_featured = true
  and lower(p.category) in ('tênis', 'tenis')
  and not exists (
    select 1 from public.promotions existing
    where existing.title = 'Na compra de dois tênis'
  )
order by p.created_at desc
limit 1;

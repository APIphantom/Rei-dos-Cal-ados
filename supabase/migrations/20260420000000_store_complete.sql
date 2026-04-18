-- Estoque em produtos, depoimentos, pedidos detalhados, contato na loja

alter table public.products
  add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

-- Depoimentos (substitui lista fixa no front)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  body text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_display_order_idx on public.testimonials (display_order asc, created_at desc);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read"
  on public.testimonials for select
  using (true);

drop policy if exists "testimonials_admin_insert" on public.testimonials;
create policy "testimonials_admin_insert"
  on public.testimonials for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "testimonials_admin_update" on public.testimonials;
create policy "testimonials_admin_update"
  on public.testimonials for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "testimonials_admin_delete" on public.testimonials;
create policy "testimonials_admin_delete"
  on public.testimonials for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

-- Dados iniciais (só se tabela vazia)
insert into public.testimonials (author_name, body, display_order)
select t.author_name, t.body, t.display_order
from (
  values
    ('Mariana S.', 'Chegou rápido e o acabamento é impecável. O conforto surpreendeu.', 0),
    ('Rafael L.', 'Atendimento no WhatsApp foi direto ao ponto. Comprei em 5 minutos.', 1),
    ('Camila A.', 'Produto lindo, ficou perfeito. Compra segura e entrega no prazo.', 2),
    ('João P.', 'Preço bom e qualidade acima do esperado. Já quero o próximo.', 3)
) as t(author_name, body, display_order)
where not exists (select 1 from public.testimonials limit 1);

-- Pedidos: detalhes do checkout
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists customer_address text;
alter table public.orders add column if not exists items_json jsonb not null default '[]';

-- Contato e redes (uma linha em site_settings)
alter table public.site_settings add column if not exists store_whatsapp_e164 text;
alter table public.site_settings add column if not exists contact_email text;
alter table public.site_settings add column if not exists contact_phone text;
alter table public.site_settings add column if not exists contact_city text;
alter table public.site_settings add column if not exists instagram_url text;
alter table public.site_settings add column if not exists facebook_url text;

update public.site_settings
set store_whatsapp_e164 = coalesce(store_whatsapp_e164, '5511999999999')
where id = 'default';

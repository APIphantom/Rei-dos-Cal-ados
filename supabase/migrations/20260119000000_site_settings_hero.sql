-- Configurações do site (hero: imagem ou vídeo)

create table if not exists public.site_settings (
  id text primary key default 'default',
  hero_media_type text not null default 'none' check (hero_media_type in ('none', 'image', 'video')),
  hero_media_url text,
  updated_at timestamptz default now()
);

insert into public.site_settings (id, hero_media_type, hero_media_url)
values ('default', 'none', null)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update"
  on public.site_settings for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "site_settings_admin_insert" on public.site_settings;
create policy "site_settings_admin_insert"
  on public.site_settings for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

-- Bucket para uploads do hero (imagem/vídeo)
insert into storage.buckets (id, name, public)
values ('hero-media', 'hero-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read hero media" on storage.objects;
create policy "Public read hero media"
  on storage.objects for select
  using (bucket_id = 'hero-media');

drop policy if exists "Admin insert hero media" on storage.objects;
create policy "Admin insert hero media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'hero-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "Admin update hero media" on storage.objects;
create policy "Admin update hero media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'hero-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  )
  with check (
    bucket_id = 'hero-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

drop policy if exists "Admin delete hero media" on storage.objects;
create policy "Admin delete hero media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'hero-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

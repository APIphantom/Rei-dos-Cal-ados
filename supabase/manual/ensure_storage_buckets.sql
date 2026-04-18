-- Execute no Supabase: SQL Editor > New query > colar e Run.
-- Corrige "Bucket not found" quando os buckets ainda não existem no projeto.

-- hero-media (hero da home)
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

-- product-images (opcional — se ainda não existir)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

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

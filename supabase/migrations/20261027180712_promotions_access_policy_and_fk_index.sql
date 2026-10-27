drop policy if exists "promotions_public_active_read" on public.promotions;
drop policy if exists "promotions_admin_read" on public.promotions;

create policy "promotions_anon_active_read"
  on public.promotions for select
  to anon
  using (is_active);

create policy "promotions_authenticated_read"
  on public.promotions for select
  to authenticated
  using (
    is_active or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'ADMIN'
    )
  );

create index if not exists promotions_product_id_idx
  on public.promotions (product_id);

update public.promotions
set image_alt = case
  when image_alt ilike 'Imagem ilustrativa:%' then image_alt
  else 'Imagem ilustrativa: ' || image_alt
end
where title = 'Na compra de dois tênis';

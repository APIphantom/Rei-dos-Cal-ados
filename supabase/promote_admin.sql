-- Promover um usuário a administrador pelo email de login.
-- Dashboard Supabase → SQL → colar e Run (troque o email).

update public.profiles
set role = 'ADMIN', updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('seu-email@exemplo.com')
  limit 1
);

-- Se não atualizou nenhuma linha: o usuário pode não ter linha em profiles.
-- Nesse caso rode (mesmo email):

insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', ''), 'ADMIN'
from auth.users
where lower(email) = lower('seu-email@exemplo.com')
on conflict (id) do update set role = 'ADMIN', updated_at = now();

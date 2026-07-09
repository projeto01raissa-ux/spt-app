-- =========================================================
-- SPT APP - Schema inicial
-- Rode isso em: Supabase > SQL Editor > New query > Run
-- =========================================================

-- 1) PERFIS DE USUÁRIO (campo | master)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role text not null default 'campo' check (role in ('campo', 'master')),
  created_at timestamptz not null default now()
);

-- cria o profile automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), 'campo');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) OBRAS
create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  nome_obra text not null,
  cliente text,
  endereco text,
  rodovia_km text,
  numero_relatorio text,
  art text,
  responsavel_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 3) FUROS (sondagens individuais, ex: F-01, F-02...)
create table if not exists public.furos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  codigo text not null, -- ex: F-03
  amostrador text default 'Ø EXT = 2 1/2"  Ø INT = 1 3/8"',
  revestimento text default 'Ø 2 3/8"',
  altura_queda_cm numeric default 75,
  peso_martelo_kg numeric default 65,
  tipo_amostrador text default 'Terzaghi',
  latitude numeric,
  longitude numeric,
  nivel_agua_m numeric,
  data_inicio date,
  data_termino date,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'concluido')),
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (obra_id, codigo)
);

-- 4) LEITURAS (uma linha por profundidade de 1m)
create table if not exists public.leituras (
  id uuid primary key default gen_random_uuid(),
  furo_id uuid not null references public.furos(id) on delete cascade,
  profundidade_m numeric not null,
  golpes_1 integer,
  golpes_2 integer,
  golpes_3 integer,
  nspt integer,
  nivel_agua_m numeric,
  profundidade_camada text, -- ex: "3,75 - 5,80"
  classificacao_material text,
  litologia text, -- código do padrão gráfico (areia, argila, etc)
  created_at timestamptz not null default now(),
  unique (furo_id, profundidade_m)
);

-- 5) FOTOS DE CAMPO
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  furo_id uuid not null references public.furos(id) on delete cascade,
  storage_path text not null,
  legenda text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.obras enable row level security;
alter table public.furos enable row level security;
alter table public.leituras enable row level security;
alter table public.fotos enable row level security;

create policy "profiles: leitura autenticada" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles: atualizar o proprio" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.is_master()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'master'
  );
$$ language sql security definer stable;

create policy "obras: leitura autenticada" on public.obras
  for select using (auth.role() = 'authenticated');
create policy "obras: master pode tudo" on public.obras
  for all using (public.is_master()) with check (public.is_master());
create policy "obras: campo pode criar" on public.obras
  for insert with check (auth.role() = 'authenticated');

create policy "furos: leitura autenticada" on public.furos
  for select using (auth.role() = 'authenticated');
create policy "furos: autenticado pode inserir" on public.furos
  for insert with check (auth.role() = 'authenticated');
create policy "furos: autenticado pode atualizar" on public.furos
  for update using (auth.role() = 'authenticated');
create policy "furos: master pode excluir" on public.furos
  for delete using (public.is_master());

create policy "leituras: leitura autenticada" on public.leituras
  for select using (auth.role() = 'authenticated');
create policy "leituras: autenticado pode inserir" on public.leituras
  for insert with check (auth.role() = 'authenticated');
create policy "leituras: autenticado pode atualizar" on public.leituras
  for update using (auth.role() = 'authenticated');
create policy "leituras: master pode excluir" on public.leituras
  for delete using (public.is_master());

create policy "fotos: leitura autenticada" on public.fotos
  for select using (auth.role() = 'authenticated');
create policy "fotos: autenticado pode inserir" on public.fotos
  for insert with check (auth.role() = 'authenticated');
create policy "fotos: master pode excluir" on public.fotos
  for delete using (public.is_master());

-- =========================================================
-- STORAGE (bucket de fotos)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('fotos-campo', 'fotos-campo', true)
on conflict (id) do nothing;

create policy "fotos-campo: leitura publica"
  on storage.objects for select
  using (bucket_id = 'fotos-campo');

create policy "fotos-campo: upload autenticado"
  on storage.objects for insert
  with check (bucket_id = 'fotos-campo' and auth.role() = 'authenticated');

-- =========================================================
-- PARA TORNAR UM USUÁRIO "MASTER":
-- rode manualmente depois que ele se cadastrar uma vez:
-- update public.profiles set role = 'master' where id = 'UUID-DO-USUARIO';
-- =========================================================

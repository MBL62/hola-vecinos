-- ============================================================
-- HOLA VECINOS — Script SQL para Supabase
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Extensiones
create extension if not exists "uuid-ossp";

-- 2. Enum types
do $$ begin
  create type post_category as enum ('producto', 'servicio', 'regalo', 'trueque');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type delivery_type as enum ('retiro', 'despacho');
exception when duplicate_object then null;
end $$;

-- 3. Profiles (vinculada a auth.users)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 4. Posts
create table if not exists posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null check (char_length(title) between 3 and 80),
  description   text not null check (char_length(description) between 10 and 500),
  image_url     text,
  category      post_category not null,
  delivery_type delivery_type not null default 'retiro',
  lat           double precision not null,
  lng           double precision not null,
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  created_at    timestamptz default now()
);

-- Trigger: limitar 2 posts activos por usuario
create or replace function check_post_limit()
returns trigger language plpgsql as $$
declare
  active_count int;
begin
  select count(*) into active_count
  from posts
  where user_id = new.user_id
    and expires_at > now();

  if active_count >= 2 then
    raise exception 'Ya tienes 2 publicaciones activas. Elimina una primero.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_post_limit on posts;
create trigger enforce_post_limit
  before insert on posts
  for each row execute procedure check_post_limit();

-- Trigger: filtro básico de contenido prohibido (server-side)
create or replace function check_content_moderation()
returns trigger language plpgsql as $$
declare
  blocked_pattern text := '(?i)\b(droga|cocaína|heroína|marihuana|arma|pistola|fusil|porno|sexo|xxx)\b';
begin
  if (new.title ~* blocked_pattern) or (new.description ~* blocked_pattern) then
    raise exception 'La publicación contiene contenido no permitido.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_content_moderation on posts;
create trigger enforce_content_moderation
  before insert or update on posts
  for each row execute procedure check_content_moderation();

-- 5. Messages
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references posts(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz default now()
);

-- 6. Reports
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references posts(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason      text not null,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
alter table profiles enable row level security;
create policy "Profiles visibles para todos"   on profiles for select using (true);
create policy "Solo el dueño puede actualizar" on profiles for update using (auth.uid() = id);

-- Posts
alter table posts enable row level security;
create policy "Posts activos visibles para todos"
  on posts for select using (expires_at > now());
create policy "Usuarios autenticados pueden crear posts"
  on posts for insert with check (auth.uid() = user_id);
create policy "Dueño puede eliminar sus posts"
  on posts for delete using (auth.uid() = user_id);

-- Messages
alter table messages enable row level security;
create policy "Ver mensajes propios"
  on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Enviar mensajes autenticado"
  on messages for insert with check (auth.uid() = sender_id);

-- Reports
alter table reports enable row level security;
create policy "Crear reportes autenticado"
  on reports for insert with check (auth.uid() = reporter_id);
create policy "Admins ven todos los reportes"
  on reports for select using (auth.uid() = reporter_id);

-- ============================================================
-- STORAGE: bucket para imágenes de publicaciones
-- Ejecutar en Supabase Dashboard → Storage → New bucket
-- Nombre: post-images | Public: true
-- O ejecuta esto (requiere permisos de superusuario):
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);
-- create policy "Imágenes públicas" on storage.objects for select using (bucket_id = 'post-images');
-- create policy "Subir imágenes autenticado" on storage.objects for insert
--   with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

-- ============================================================
-- REALTIME: habilitar para mensajes
-- ============================================================
alter publication supabase_realtime add table messages;

-- ============================================================
-- ÍNDICES de rendimiento
-- ============================================================
create index if not exists idx_posts_expires on posts(expires_at);
create index if not exists idx_posts_user    on posts(user_id);
create index if not exists idx_msgs_post     on messages(post_id);
create index if not exists idx_msgs_sender   on messages(sender_id);

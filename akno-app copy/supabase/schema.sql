-- Akno · schéma Supabase
-- À coller dans Supabase > SQL Editor > New query > Run (une seule fois).

-- 1. Artisans (1 ligne = 1 compte de connexion)
create table if not exists public.artisans (
  id              uuid primary key references auth.users(id) on delete cascade,
  nom_entreprise  text not null default '',
  prenom          text not null default '',
  email           text,
  telephone       text,
  retell_agent_id text unique,
  created_at      timestamptz not null default now()
);

-- 2. Appels (rempli par n8n après chaque appel Retell)
create table if not exists public.calls (
  id               bigint generated always as identity primary key,
  artisan_id       uuid not null references public.artisans(id) on delete cascade,
  retell_call_id   text unique,               -- évite les doublons si n8n rejoue
  nom_client       text,
  telephone_client text,
  motif            text,
  besoin_detail    text,
  resume           text,                      -- call_summary Retell
  code_postal      text,
  ville            text,
  adresse          text,
  email_client     text,
  rdv_date         timestamptz,
  type_demande     text,
  urgence          text not null default 'normal' check (urgence in ('normal','urgent')),
  raison_blocage   text,
  transcript       text,
  recording_url    text,
  duration         integer,                   -- secondes
  statut           text not null default 'a_rappeler'
                   check (statut in ('a_rappeler','rappele','rdv_pris','renseigne','traite')),
  notes            text,
  created_at       timestamptz not null default now()
);
create index if not exists calls_artisan_created on public.calls(artisan_id, created_at desc);

-- 3. Rendez-vous (agenda de l'app)
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  artisan_id       uuid not null default auth.uid() references public.artisans(id) on delete cascade,
  call_id          bigint references public.calls(id) on delete set null,
  title            text not null default 'Rendez-vous',
  client           text,
  telephone_client text,
  "start"          timestamptz not null,
  "end"            timestamptz not null,
  adresse          text,
  ville            text,
  notes            text,
  created_at       timestamptz not null default now(),
  check ("end" > "start")
);
create index if not exists appointments_artisan_start on public.appointments(artisan_id, "start");

-- 4. Sécurité : chaque artisan ne voit que ses lignes (RLS)
alter table public.artisans     enable row level security;
alter table public.calls        enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "artisan lit son profil" on public.artisans;
create policy "artisan lit son profil" on public.artisans
  for select to authenticated using (id = auth.uid());
drop policy if exists "artisan modifie son profil" on public.artisans;
create policy "artisan modifie son profil" on public.artisans
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "artisan lit ses appels" on public.calls;
create policy "artisan lit ses appels" on public.calls
  for select to authenticated using (artisan_id = auth.uid());
drop policy if exists "artisan met a jour ses appels" on public.calls;
create policy "artisan met a jour ses appels" on public.calls
  for update to authenticated using (artisan_id = auth.uid()) with check (artisan_id = auth.uid());
-- Pas de policy INSERT/DELETE sur calls pour les artisans :
-- seuls n8n (clé service_role, qui contourne RLS) crée les appels.

drop policy if exists "artisan gere ses rdv" on public.appointments;
create policy "artisan gere ses rdv" on public.appointments
  for all to authenticated using (artisan_id = auth.uid()) with check (artisan_id = auth.uid());

-- L'app ne peut modifier que le statut, la note et la date de RDV d'un appel
revoke update on public.calls from authenticated;
grant  update (statut, notes, rdv_date) on public.calls to authenticated;

-- 5. Temps réel : les nouveaux appels apparaissent sans recharger
do $$ begin
  alter publication supabase_realtime add table public.calls;
exception when duplicate_object then null; end $$;

-- 6. Aide n8n : retrouver l'artisan à partir de l'agent Retell
--    (appelée avec la clé service_role uniquement)
create or replace function public.artisan_for_agent(p_agent_id text)
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.artisans where retell_agent_id = p_agent_id
$$;
revoke execute on function public.artisan_for_agent(text) from public, anon, authenticated;
grant  execute on function public.artisan_for_agent(text) to service_role;

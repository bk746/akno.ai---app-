-- Devis · à exécuter dans Supabase SQL Editor (après schema.sql)

create table if not exists public.devis (
  id                uuid primary key default gen_random_uuid(),
  artisan_id        uuid not null default auth.uid() references public.artisans(id) on delete cascade,
  numero            text not null,
  statut            text not null default 'brouillon'
                    check (statut in ('brouillon','envoye','relance','accepte','refuse')),
  relance_count     integer not null default 0 check (relance_count >= 0),
  client_nom        text not null default '',
  client_email      text,
  client_telephone  text,
  client_adresse    text,
  objet             text not null default '',
  lignes            jsonb not null default '[]'::jsonb,
  tva_taux          numeric(5,2) not null default 20 check (tva_taux in (5.5, 10, 20)),
  token             uuid not null default gen_random_uuid(),
  call_id           bigint references public.calls(id) on delete set null,
  envoye_le         timestamptz,
  relance_le        timestamptz,
  repondu_le        timestamptz,
  reponse           text check (reponse is null or reponse in ('accepte','refuse')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (artisan_id, numero),
  unique (token)
);

create index if not exists devis_artisan_created on public.devis (artisan_id, created_at desc);

alter table public.devis enable row level security;

drop policy if exists "artisan gere ses devis" on public.devis;
create policy "artisan gere ses devis" on public.devis
  for all to authenticated
  using (artisan_id = auth.uid())
  with check (artisan_id = auth.uid());

create or replace function public.devis_next_numero(p_artisan_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  y text := to_char(now(), 'YYYY');
  n integer;
begin
  select coalesce(
    max(substring(numero from '-([0-9]+)$')::integer),
    0
  ) + 1
  into n
  from public.devis
  where artisan_id = p_artisan_id
    and numero ~ ('^D-' || y || '-[0-9]+$');
  return 'D-' || y || '-' || lpad(n::text, 4, '0');
end;
$$;

revoke execute on function public.devis_next_numero(uuid) from public;
grant execute on function public.devis_next_numero(uuid) to authenticated;

create or replace function public.devis_public(p_token uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'numero', d.numero,
    'objet', d.objet,
    'client_nom', d.client_nom,
    'client_email', d.client_email,
    'client_telephone', d.client_telephone,
    'client_adresse', d.client_adresse,
    'lignes', d.lignes,
    'tva_taux', d.tva_taux,
    'statut', d.statut,
    'relance_count', d.relance_count,
    'envoye_le', d.envoye_le,
    'reponse', d.reponse,
    'repondu_le', d.repondu_le,
    'entreprise', coalesce(a.nom_entreprise, ''),
    'artisan_prenom', coalesce(a.prenom, '')
  )
  from public.devis d
  join public.artisans a on a.id = d.artisan_id
  where d.token = p_token
    and d.statut in ('envoye', 'relance', 'accepte', 'refuse');
$$;

revoke execute on function public.devis_public(uuid) from public;
grant execute on function public.devis_public(uuid) to anon, authenticated;

create or replace function public.devis_repondre(p_token uuid, p_reponse text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.devis%rowtype;
begin
  if p_reponse not in ('accepte', 'refuse') then
    raise exception 'invalid response';
  end if;
  select * into d from public.devis where token = p_token for update;
  if not found then
    raise exception 'not found';
  end if;
  if d.statut not in ('envoye', 'relance') or d.reponse is not null then
    raise exception 'cannot respond';
  end if;
  update public.devis
  set statut = case when p_reponse = 'accepte' then 'accepte' else 'refuse' end,
      reponse = p_reponse,
      repondu_le = now(),
      updated_at = now()
  where id = d.id;
  return json_build_object('ok', true, 'statut', case when p_reponse = 'accepte' then 'accepte' else 'refuse' end);
end;
$$;

revoke execute on function public.devis_repondre(uuid, text) from public;
grant execute on function public.devis_repondre(uuid, text) to anon, authenticated;

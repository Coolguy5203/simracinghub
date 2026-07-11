-- =============================================
-- SimRacer Hub — Supabase Schema
-- Uses srh_ prefix to share the RaceRoyale project namespace
-- =============================================

-- PROFILES
create table if not exists public.srh_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- GAMES
create table if not exists public.srh_games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon_url text,
  cover_url text,
  platform text not null default 'PC',
  created_at timestamptz default now() not null
);

-- EVENTS
create table if not exists public.srh_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.srh_games(id) on delete cascade not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  event_date timestamptz not null,
  platform text not null default 'PC',
  server_info text,
  max_participants integer,
  external_link text,
  created_at timestamptz default now() not null
);

-- EVENT RSVPS
create table if not exists public.srh_event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.srh_events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(event_id, user_id)
);

-- TEAMS (cross-sim: not tied to any game)
create table if not exists public.srh_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text check (tag is null or char_length(tag) between 2 and 4),
  color text not null default '#e8322a',
  description text,
  invite_code text unique not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  announcements text,
  created_at timestamptz default now() not null
);

-- TEAM RANKS (custom ranks / driver roles, managed by owners)
create table if not exists public.srh_team_ranks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.srh_teams(id) on delete cascade not null,
  name text not null check (char_length(name) between 1 and 30),
  color text not null default '#94a3b8',
  position integer not null default 0,
  created_at timestamptz default now() not null
);

-- TEAM MEMBERS
create table if not exists public.srh_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.srh_teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  rank_id uuid references public.srh_team_ranks(id) on delete set null,
  joined_at timestamptz default now() not null,
  unique(team_id, user_id)
);

-- GAME UPDATES
create table if not exists public.srh_game_updates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.srh_games(id) on delete cascade not null,
  version text not null,
  release_date date not null,
  summary text,
  added_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(game_id, version)
);

-- UPDATE RATINGS
create table if not exists public.srh_update_ratings (
  id uuid primary key default gen_random_uuid(),
  update_id uuid references public.srh_game_updates(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now() not null,
  unique(update_id, user_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.srh_profiles enable row level security;
alter table public.srh_games enable row level security;
alter table public.srh_events enable row level security;
alter table public.srh_event_rsvps enable row level security;
alter table public.srh_teams enable row level security;
alter table public.srh_team_members enable row level security;
alter table public.srh_team_ranks enable row level security;
alter table public.srh_game_updates enable row level security;
alter table public.srh_update_ratings enable row level security;

-- PROFILES
create policy "srh_profiles_select_all" on public.srh_profiles for select using (true);
create policy "srh_profiles_insert_own" on public.srh_profiles for insert with check (auth.uid() = id);
create policy "srh_profiles_update_own" on public.srh_profiles for update using (auth.uid() = id);

-- GAMES (read-only for everyone)
create policy "srh_games_select_all" on public.srh_games for select using (true);

-- EVENTS
create policy "srh_events_select_all" on public.srh_events for select using (true);
create policy "srh_events_insert_auth" on public.srh_events for insert with check (auth.uid() = created_by);
create policy "srh_events_update_own" on public.srh_events for update using (auth.uid() = created_by);
create policy "srh_events_delete_own" on public.srh_events for delete using (auth.uid() = created_by);

-- EVENT RSVPS
create policy "srh_rsvps_select_all" on public.srh_event_rsvps for select using (true);
create policy "srh_rsvps_insert_auth" on public.srh_event_rsvps for insert with check (auth.uid() = user_id);
create policy "srh_rsvps_delete_own" on public.srh_event_rsvps for delete using (auth.uid() = user_id);

-- SECURITY DEFINER helpers (avoid RLS self-recursion on srh_team_members)
create or replace function public.srh_is_team_member(t uuid)
returns boolean language sql security definer stable set search_path = public as
$fn$ select exists (select 1 from public.srh_team_members where team_id = t and user_id = auth.uid()) $fn$;

create or replace function public.srh_is_team_owner(t uuid)
returns boolean language sql security definer stable set search_path = public as
$fn$ select exists (select 1 from public.srh_team_members where team_id = t and user_id = auth.uid() and role = 'owner') $fn$;

-- TEAMS
create policy "srh_teams_select_all" on public.srh_teams for select using (true);
create policy "srh_teams_insert_auth" on public.srh_teams for insert with check (auth.uid() = created_by);
create policy "srh_teams_update_owner" on public.srh_teams for update using (public.srh_is_team_owner(id));
create policy "srh_teams_delete_owner" on public.srh_teams for delete using (auth.uid() = created_by);

-- TEAM MEMBERS
create policy "srh_team_members_select_member" on public.srh_team_members for select using (public.srh_is_team_member(team_id));
create policy "srh_team_members_insert_any" on public.srh_team_members for insert with check (auth.uid() = user_id);
create policy "srh_team_members_update_owner" on public.srh_team_members for update using (public.srh_is_team_owner(team_id));
create policy "srh_team_members_delete_owner_or_self" on public.srh_team_members for delete using (
  auth.uid() = user_id or public.srh_is_team_owner(team_id)
);

-- TEAM RANKS
create policy "srh_team_ranks_select_member" on public.srh_team_ranks for select using (public.srh_is_team_member(team_id));
create policy "srh_team_ranks_insert_owner" on public.srh_team_ranks for insert with check (public.srh_is_team_owner(team_id));
create policy "srh_team_ranks_update_owner" on public.srh_team_ranks for update using (public.srh_is_team_owner(team_id));
create policy "srh_team_ranks_delete_owner" on public.srh_team_ranks for delete using (public.srh_is_team_owner(team_id));

-- AUTO-OWNER TRIGGER: team creator becomes owner + default ranks are seeded
create or replace function public.srh_team_on_create()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.srh_team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (team_id, user_id) do update set role = 'owner';

  insert into public.srh_team_ranks (team_id, name, color, position) values
    (new.id, 'Team Principal', '#f59e0b', 0),
    (new.id, 'Race Driver', '#3b82f6', 1),
    (new.id, 'Reserve Driver', '#94a3b8', 2);
  return new;
end $fn$;

drop trigger if exists srh_team_auto_owner on public.srh_teams;
create trigger srh_team_auto_owner
  after insert on public.srh_teams
  for each row execute function public.srh_team_on_create();

-- GAME UPDATES
create policy "srh_updates_select_all" on public.srh_game_updates for select using (true);
create policy "srh_updates_insert_auth" on public.srh_game_updates for insert with check (auth.uid() = added_by);

-- UPDATE RATINGS
create policy "srh_ratings_select_all" on public.srh_update_ratings for select using (true);
create policy "srh_ratings_insert_auth" on public.srh_update_ratings for insert with check (auth.uid() = user_id);
create policy "srh_ratings_update_own" on public.srh_update_ratings for update using (auth.uid() = user_id);
create policy "srh_ratings_delete_own" on public.srh_update_ratings for delete using (auth.uid() = user_id);

-- =============================================
-- PROFILE FOREIGN KEYS (required for PostgREST embeds)
-- PostgREST can only resolve profiles:srh_profiles(...) joins when an FK
-- exists to srh_profiles; the auth.users FKs alone are not visible to it.
-- =============================================

alter table public.srh_events
  add constraint srh_events_created_by_profile_fkey
  foreign key (created_by) references public.srh_profiles(id) on delete cascade;

alter table public.srh_event_rsvps
  add constraint srh_event_rsvps_user_id_profile_fkey
  foreign key (user_id) references public.srh_profiles(id) on delete cascade;

alter table public.srh_teams
  add constraint srh_teams_created_by_profile_fkey
  foreign key (created_by) references public.srh_profiles(id) on delete cascade;

alter table public.srh_team_members
  add constraint srh_team_members_user_id_profile_fkey
  foreign key (user_id) references public.srh_profiles(id) on delete cascade;

alter table public.srh_game_updates
  add constraint srh_game_updates_added_by_profile_fkey
  foreign key (added_by) references public.srh_profiles(id) on delete cascade;

alter table public.srh_update_ratings
  add constraint srh_update_ratings_user_id_profile_fkey
  foreign key (user_id) references public.srh_profiles(id) on delete cascade;

-- =============================================
-- LEGACY GAMES + HARDENING (July 2026)
-- =============================================

-- Older titles stay on the hub (flagged legacy) so events/updates can still be logged
alter table public.srh_games add column if not exists legacy boolean not null default false;

-- Advisor fixes: pin search_path, remove trigger fns from the public RPC surface
alter function public.srh_auto_confirm_user() set search_path = '';
revoke execute on function public.srh_auto_confirm_user() from public, anon, authenticated;
revoke execute on function public.srh_team_on_create() from public, anon, authenticated;

-- Public member counts (RLS hides roster rows from non-members; expose only the aggregate)
create or replace function public.srh_team_member_counts()
returns table(team_id uuid, member_count bigint)
language sql stable security definer set search_path = public as
$$ select team_id, count(*) from public.srh_team_members group by team_id $$;

grant execute on function public.srh_team_member_counts() to anon, authenticated;

-- =============================================
-- COMMUNITY FEATURES (July 2026): discussion, team radio, rig specs
-- =============================================

-- EVENT DISCUSSION
create table if not exists public.srh_event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.srh_events(id) on delete cascade not null,
  user_id uuid references public.srh_profiles(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now() not null
);

alter table public.srh_event_comments enable row level security;

create policy "srh_comments_select_all" on public.srh_event_comments
  for select using (true);
create policy "srh_comments_insert_own" on public.srh_event_comments
  for insert with check (auth.uid() = user_id);
create policy "srh_comments_delete_own_or_host" on public.srh_event_comments
  for delete using (
    auth.uid() = user_id
    or exists (select 1 from public.srh_events e where e.id = event_id and e.created_by = auth.uid())
  );

create index if not exists srh_event_comments_event_idx on public.srh_event_comments(event_id, created_at);

-- TEAM RADIO (private, members only)
create table if not exists public.srh_team_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.srh_teams(id) on delete cascade not null,
  user_id uuid references public.srh_profiles(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now() not null
);

alter table public.srh_team_messages enable row level security;

create policy "srh_messages_select_member" on public.srh_team_messages
  for select using (public.srh_is_team_member(team_id));
create policy "srh_messages_insert_member" on public.srh_team_messages
  for insert with check (auth.uid() = user_id and public.srh_is_team_member(team_id));
create policy "srh_messages_delete_own_or_owner" on public.srh_team_messages
  for delete using (auth.uid() = user_id or public.srh_is_team_owner(team_id));

create index if not exists srh_team_messages_team_idx on public.srh_team_messages(team_id, created_at desc);

-- RIG SPECS + FAVORITE SIM
alter table public.srh_profiles add column if not exists wheel text;
alter table public.srh_profiles add column if not exists pedals text;
alter table public.srh_profiles add column if not exists cockpit text;
alter table public.srh_profiles add column if not exists favorite_game_id uuid references public.srh_games(id) on delete set null;

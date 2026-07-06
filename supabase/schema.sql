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

-- TEAMS
create table if not exists public.srh_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  game_id uuid references public.srh_games(id) on delete set null,
  invite_code text unique not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  announcements text,
  created_at timestamptz default now() not null
);

-- TEAM MEMBERS
create table if not exists public.srh_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.srh_teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
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

-- TEAMS
create policy "srh_teams_select_all" on public.srh_teams for select using (true);
create policy "srh_teams_insert_auth" on public.srh_teams for insert with check (auth.uid() = created_by);
create policy "srh_teams_update_owner" on public.srh_teams for update using (
  exists (select 1 from public.srh_team_members where team_id = id and user_id = auth.uid() and role = 'owner')
);
create policy "srh_teams_delete_owner" on public.srh_teams for delete using (auth.uid() = created_by);

-- TEAM MEMBERS
create policy "srh_team_members_select_member" on public.srh_team_members for select using (
  exists (select 1 from public.srh_team_members tm where tm.team_id = team_id and tm.user_id = auth.uid())
);
create policy "srh_team_members_insert_any" on public.srh_team_members for insert with check (auth.uid() = user_id);
create policy "srh_team_members_update_owner" on public.srh_team_members for update using (
  exists (select 1 from public.srh_team_members tm where tm.team_id = team_id and tm.user_id = auth.uid() and tm.role = 'owner')
);
create policy "srh_team_members_delete_owner_or_self" on public.srh_team_members for delete using (
  auth.uid() = user_id or
  exists (select 1 from public.srh_team_members tm where tm.team_id = team_id and tm.user_id = auth.uid() and tm.role = 'owner')
);

-- GAME UPDATES
create policy "srh_updates_select_all" on public.srh_game_updates for select using (true);
create policy "srh_updates_insert_auth" on public.srh_game_updates for insert with check (auth.uid() = added_by);

-- UPDATE RATINGS
create policy "srh_ratings_select_all" on public.srh_update_ratings for select using (true);
create policy "srh_ratings_insert_auth" on public.srh_update_ratings for insert with check (auth.uid() = user_id);
create policy "srh_ratings_update_own" on public.srh_update_ratings for update using (auth.uid() = user_id);
create policy "srh_ratings_delete_own" on public.srh_update_ratings for delete using (auth.uid() = user_id);

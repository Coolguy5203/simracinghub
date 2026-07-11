# SimRacer Hub

Community site for sim racers — find events, form cross-sim teams, and rate game updates across iRacing, Assetto Corsa EVO, ACC, Le Mans Ultimate, F1 26, Gran Turismo 7, Forza Motorsport, Automobilista 2, rFactor 2, EA Sports WRC, RaceRoom, and more.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, Postgres, RLS)
- **Tailwind CSS**
- **Vercel** (deployment)

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd simracer-hub
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Project Settings → API

### 3. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciO...
```

### 4. Apply the database schema

In your Supabase dashboard → SQL Editor, run:

1. `supabase/schema.sql` — creates all tables, triggers, functions + RLS policies
2. `supabase/seed.sql` — seeds the game records (current + legacy titles)

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 5. Configure Supabase Auth

In your Supabase dashboard → Authentication → Settings:

- **Disable email confirmations** (we use synthetic emails, no real email flow —
  the `srh_auto_confirm_on_signup` trigger also handles this at the DB level)
- Site URL: `http://localhost:3000` (or your Vercel URL)

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

Update your Supabase Auth Site URL to the Vercel production URL after deploy.

## Feature Overview

| Feature | Description |
|---------|-------------|
| **Auth** | Username + password (synthetic email via Supabase Auth) |
| **Games** | 11 current titles + legacy titles (F1 24, F1 25); each has its own landing page |
| **Events** | Create, RSVP, live countdowns, Google Calendar links, past/upcoming filters |
| **Teams** | Private cross-sim teams with invite codes, custom ranks, livery colors |
| **Update Ratings** | Add game patches, star-rate and review, rating distribution charts |
| **Profiles** | Public driver profiles (`/u/username`), bios, activity stats |
| **Dashboard** | Signed-in homepage with your next races and teams |

## Project Structure

```
app/
  (auth)/login        — Sign in page
  (auth)/register     — Register page
  games/              — All games index (current + legacy)
  games/[slug]/       — Game landing page
    updates/          — Patch list + add form
    updates/[id]/     — Patch detail + rating form
  events/             — Event listing
  events/new          — Create event
  events/[id]/        — Event detail + RSVP
  teams/              — Team listing + join by code
  teams/new           — Create team
  teams/[id]/         — Team page (members only)
  teams/[id]/edit     — Edit team + rank manager (owner only)
  u/[username]/       — Public driver profile
  settings/           — Edit bio, change password
components/           — Shared client components
lib/
  supabase/           — Client, server, middleware helpers
  games.ts            — Per-game visual themes
  utils.ts            — cn(), generateInviteCode(), syntheticEmail()
supabase/
  schema.sql          — Full DB schema, triggers, functions + RLS
  seed.sql            — Game seed data
```

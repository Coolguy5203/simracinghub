# SimRacer Hub

Community site for sim racers â€” find events, form private teams, and rate game updates across iRacing, Assetto Corsa EVO, ACC, Le Mans Ultimate, F1 26, Gran Turismo 7, Forza Motorsport, Automobilista 2, rFactor 2, EA Sports WRC, RaceRoom, and more.

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
2. Copy your **Project URL** and **anon public key** from Project Settings â†’ API

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

In your Supabase dashboard â†’ SQL Editor, run:

1. `supabase/schema.sql` â€” creates all tables + RLS policies
2. `supabase/seed.sql` â€” seeds the 7 game records

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 5. Configure Supabase Auth

In your Supabase dashboard â†’ Authentication â†’ Settings:

- **Disable email confirmations** (we use synthetic emails, no real email flow)
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
| **Games** | 7 titles seeded; each has its own landing page |
| **Events** | Create, RSVP, edit/delete own events per game |
| **Teams** | Private invite-only teams with invite codes and owner controls |
| **Update Ratings** | Add game patches, star-rate and review each one |

## Project Structure

```
app/
  (auth)/login        â€” Sign in page
  (auth)/register     â€” Register page
  games/[slug]/       â€” Game landing page
    updates/          â€” Patch list + add form
    updates/[id]/     â€” Patch detail + rating form
  events/             â€” Event listing
  events/new          â€” Create event
  events/[id]/        â€” Event detail + RSVP
  teams/              â€” Team listing + join by code
  teams/new           â€” Create team
  teams/[id]/         â€” Team page (members only)
  teams/[id]/edit     â€” Edit team (owner only)
components/           â€” Shared client components
lib/
  supabase/           â€” Client, server, middleware helpers
  database.types.ts   â€” TypeScript DB types
  utils.ts            â€” cn(), generateInviteCode(), syntheticEmail()
supabase/
  schema.sql          â€” Full DB schema + RLS
  seed.sql            â€” Game seed data
```

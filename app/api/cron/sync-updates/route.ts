import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Steam App IDs for games that publish patch notes on Steam
const STEAM_GAMES: { slug: string; appId: number }[] = [
  { slug: 'acc',              appId: 805550  },  // Assetto Corsa Competizione
  { slug: 'rfactor2',         appId: 365960  },  // rFactor 2
  { slug: 'automobilista2',   appId: 1066890 },  // Automobilista 2
  { slug: 'forza-motorsport', appId: 2440510 },  // Forza Motorsport
  { slug: 'ea-wrc',           appId: 1708520 },  // EA Sports WRC
  { slug: 'raceroom',         appId: 211500  },  // RaceRoom Racing Experience
  { slug: 'lemans-ultimate',  appId: 1867561 },  // Le Mans Ultimate
  { slug: 'ac-evo',           appId: 2890870 },  // Assetto Corsa EVO
]

// Keywords that identify patch note posts vs. generic news
const PATCH_KEYWORDS = [
  'update', 'patch', 'hotfix', 'fix', 'build', 'release', 'version',
  'season', 'content', 'dlc', 'v1.', 'v2.', 'v3.', 'v0.',
]

function isPatchNote(title: string): boolean {
  const lower = title.toLowerCase()
  return PATCH_KEYWORDS.some(kw => lower.includes(kw))
}

// Extract a short version string from a Steam post title
function extractVersion(title: string): string {
  // Try "v1.2.3" or "1.2.3.4" patterns first
  const semver = title.match(/v?\d+\.\d+[\.\d]*/i)
  if (semver) return semver[0]
  // Fall back to truncated title
  return title.length > 60 ? title.slice(0, 60) + '…' : title
}

// Trim Steam HTML/Markdown junk from content for the summary
function cleanSummary(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')          // strip HTML tags
    .replace(/\[.*?\]/g, '')          // strip BBCode tags
    .replace(/https?:\/\/\S+/g, '')   // strip URLs
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 400)
}

export async function GET(req: NextRequest) {
  // Vercel cron requests include this header; reject anything else
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Load all games so we can map slug → id
  const { data: games, error: gamesErr } = await supabase
    .from('srh_games')
    .select('id, slug')

  if (gamesErr || !games) {
    return NextResponse.json({ error: 'Failed to load games' }, { status: 500 })
  }

  const slugToId = Object.fromEntries(games.map((g: any) => [g.slug, g.id]))

  const results: { slug: string; inserted: number; skipped: number; error?: string }[] = []

  for (const { slug, appId } of STEAM_GAMES) {
    const gameId = slugToId[slug]
    if (!gameId) {
      results.push({ slug, inserted: 0, skipped: 0, error: 'game not found in DB' })
      continue
    }

    let newsItems: any[]
    try {
      const res = await fetch(
        `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=10&maxlength=1500&format=json`,
        { next: { revalidate: 0 } }
      )
      const json = await res.json()
      newsItems = json?.appnews?.newsitems ?? []
    } catch (err) {
      results.push({ slug, inserted: 0, skipped: 0, error: 'Steam API fetch failed' })
      continue
    }

    // Filter to patch note posts only
    const patches = newsItems.filter((item: any) => isPatchNote(item.title))

    let inserted = 0
    let skipped = 0

    for (const item of patches) {
      const version = extractVersion(item.title)
      const releaseDate = new Date(item.date * 1000).toISOString().slice(0, 10)
      const summary = cleanSummary(item.contents ?? '')

      // Skip if this version already exists for this game
      const { data: existing } = await supabase
        .from('srh_game_updates')
        .select('id')
        .eq('game_id', gameId)
        .eq('version', version)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const { error: insertErr } = await supabase
        .from('srh_game_updates')
        .insert({
          game_id: gameId,
          version,
          release_date: releaseDate,
          summary: summary || null,
          added_by: null,
        })

      if (insertErr) {
        results.push({ slug, inserted, skipped, error: insertErr.message })
        break
      }
      inserted++
    }

    results.push({ slug, inserted, skipped })
  }

  const totalInserted = results.reduce((s, r) => s + r.inserted, 0)
  return NextResponse.json({ ok: true, totalInserted, results })
}

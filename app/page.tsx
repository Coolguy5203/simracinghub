import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Star, ChevronRight, Flag, Gauge, Trophy, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { GAME_THEMES } from '@/lib/games'
import { Avatar } from '@/components/Avatar'

const FEATURED_GAMES = [
  { name: 'iRacing', slug: 'iracing', tag: 'PC' },
  { name: 'Assetto Corsa Competizione', slug: 'acc', tag: 'PC / Console' },
  { name: 'rFactor 2', slug: 'rfactor2', tag: 'PC' },
  { name: 'Automobilista 2', slug: 'automobilista2', tag: 'PC' },
  { name: 'F1 24', slug: 'f1-24', tag: 'PC / Console' },
  { name: 'Gran Turismo 7', slug: 'gran-turismo-7', tag: 'Console' },
  { name: 'RaceRoom', slug: 'raceroom', tag: 'PC' },
]

export default async function Home() {
  const supabase = createClient()

  const [
    { data: upcomingEvents },
    { data: recentTeams },
    { data: latestReviews },
    { count: driverCount },
    { count: eventCount },
    { count: teamCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase
      .from('srh_events')
      .select('id, title, event_date, platform, games:srh_games(name, slug), event_rsvps:srh_event_rsvps(id)')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(4),
    supabase
      .from('srh_teams')
      .select('id, name, tag, color, description')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('srh_update_ratings')
      .select('id, rating, review, created_at, profiles:srh_profiles(username), updates:srh_game_updates(version, games:srh_games(name, slug))')
      .not('review', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('srh_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('srh_events').select('*', { count: 'exact', head: true }),
    supabase.from('srh_teams').select('*', { count: 'exact', head: true }),
    supabase.from('srh_update_ratings').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { icon: Gauge, label: 'Drivers', value: driverCount ?? 0 },
    { icon: Calendar, label: 'Events', value: eventCount ?? 0 },
    { icon: Trophy, label: 'Teams', value: teamCount ?? 0 },
    { icon: MessageSquare, label: 'Reviews', value: reviewCount ?? 0 },
  ]

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border checkered bg-surface-1">
        {/* glow + speed lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,50,42,0.12),transparent_60%)]" />
        <div className="absolute top-1/4 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-accent/60 to-transparent animate-speed-line" />
        <div className="absolute top-2/3 left-0 h-px w-1/4 bg-gradient-to-r from-transparent via-slate-400/40 to-transparent animate-speed-line [animation-delay:1.2s]" />

        <div className="relative text-center py-16 px-4 space-y-5">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium animate-fade-up">
            <Flag size={14} /> Community Hub for Sim Racers
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-100 leading-tight animate-fade-up [animation-delay:80ms]">
            Find events. Build teams.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Rate every update.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto animate-fade-up [animation-delay:160ms]">
            The central hub for iRacing, ACC, rFactor 2, Automobilista 2, F1 24, Gran Turismo 7, RaceRoom, and more.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 animate-fade-up [animation-delay:240ms]">
            <Link href="/events" className="btn-primary flex items-center gap-2">
              <Calendar size={16} /> Browse Events
            </Link>
            <Link href="/register" className="btn-secondary">Join the Hub</Link>
          </div>
        </div>
      </section>

      {/* Community stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card card-hover text-center py-4">
            <Icon size={18} className="text-accent mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-slate-100 font-mono tabular-nums">{value}</p>
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      {/* Games grid */}
      <section>
        <h2 className="section-title flex items-center gap-2"><Flag size={18} className="text-accent" /> Game Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURED_GAMES.map(game => {
            const theme = GAME_THEMES[game.slug]
            return (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className={`card card-hover bg-gradient-to-br ${theme.gradient} group flex items-center gap-3`}
              >
                <span className={`flex items-center justify-center w-11 h-11 rounded-lg ${theme.solid} text-white font-bold text-xs shrink-0 shadow-lg ${theme.glow}`}>
                  {theme.monogram}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 group-hover:text-white text-sm truncate">{game.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{game.tag}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <Calendar size={18} className="text-accent" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-sm text-accent hover:text-accent-hover">View all →</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev: any) => (
                <Link key={ev.id} href={`/events/${ev.id}`} className="card card-hover block group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-100 group-hover:text-white truncate">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ev.games?.name} · {ev.platform} · {ev.event_rsvps?.length ?? 0} going
                      </p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-semibold text-accent">{format(new Date(ev.event_date), 'MMM d')}</p>
                      <p className="text-xs text-slate-500">{format(new Date(ev.event_date), 'HH:mm')}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="card text-center text-slate-500 text-sm py-8">
                No upcoming events yet.{' '}
                <Link href="/events/new" className="text-accent hover:underline">Create one!</Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent teams */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <Users size={18} className="text-accent" /> Recent Teams
            </h2>
            <Link href="/teams" className="text-sm text-accent hover:text-accent-hover">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentTeams && recentTeams.length > 0 ? (
              recentTeams.map((t: any) => (
                <Link key={t.id} href={`/teams/${t.id}`} className="card card-hover block group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color ?? '#e8322a' }} />
                      <p className="font-medium text-slate-100 group-hover:text-white truncate">
                        {t.tag && <span className="font-mono text-sm mr-1.5" style={{ color: t.color ?? '#e8322a' }}>[{t.tag}]</span>}
                        {t.name}
                      </p>
                    </div>
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{t.description}</p>
                  )}
                </Link>
              ))
            ) : (
              <div className="card text-center text-slate-500 text-sm py-8">
                No teams yet.{' '}
                <Link href="/teams/new" className="text-accent hover:underline">Start one!</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Latest reviews */}
      {latestReviews && latestReviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <Star size={18} className="text-accent" /> Latest Reviews
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {latestReviews.map((r: any) => (
              <div key={r.id} className="card card-hover">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar username={r.profiles?.username ?? '??'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${r.profiles?.username}`} className="text-sm font-medium text-slate-200 hover:text-accent truncate block">
                      {r.profiles?.username}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      on {r.updates?.games?.name} {r.updates?.version}
                    </p>
                  </div>
                  <span className="flex items-center gap-0.5 text-yellow-400 text-sm shrink-0">
                    <Star size={12} fill="currentColor" /> {r.rating}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-3">{r.review}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

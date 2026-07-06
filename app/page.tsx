import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Star, ChevronRight, Flag } from 'lucide-react'
import { format } from 'date-fns'

const FEATURED_GAMES = [
  { name: 'iRacing', slug: 'iracing', color: 'from-blue-900/40', tag: 'PC' },
  { name: 'Assetto Corsa Competizione', slug: 'acc', color: 'from-orange-900/40', tag: 'PC / Console' },
  { name: 'rFactor 2', slug: 'rfactor2', color: 'from-green-900/40', tag: 'PC' },
  { name: 'Automobilista 2', slug: 'automobilista2', color: 'from-yellow-900/40', tag: 'PC' },
  { name: 'F1 24', slug: 'f1-24', color: 'from-red-900/40', tag: 'PC / Console' },
  { name: 'Gran Turismo 7', slug: 'gran-turismo-7', color: 'from-purple-900/40', tag: 'Console' },
  { name: 'RaceRoom', slug: 'raceroom', color: 'from-sky-900/40', tag: 'PC' },
]

export default async function Home() {
  const supabase = createClient()

  const [{ data: upcomingEvents }, { data: recentTeams }] = await Promise.all([
    supabase
      .from('srh_events')
      .select('id, title, event_date, platform, games:srh_games(name, slug)')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(4),
    supabase
      .from('srh_teams')
      .select('id, name, description, games:srh_games(name, slug)')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-2">
          <Flag size={14} /> Community Hub for Sim Racers
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight">
          Find events. Build teams.<br />
          <span className="text-accent">Rate every update.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          The central hub for iRacing, ACC, rFactor 2, Automobilista 2, F1 24, Gran Turismo 7, RaceRoom, and more.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/events" className="btn-primary flex items-center gap-2">
            <Calendar size={16} /> Browse Events
          </Link>
          <Link href="/register" className="btn-secondary">Join the Hub</Link>
        </div>
      </section>

      {/* Games grid */}
      <section>
        <h2 className="section-title flex items-center gap-2"><Flag size={18} className="text-accent" /> Game Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURED_GAMES.map(game => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className={`card bg-gradient-to-br ${game.color} to-surface-1 hover:border-accent/40 transition-all group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100 group-hover:text-white text-sm">{game.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{game.tag}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <Calendar size={18} className="text-accent" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-sm text-accent hover:text-accent-hover">View all â†’</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev: any) => (
                <Link key={ev.id} href={`/events/${ev.id}`} className="card hover:border-accent/30 transition-all block group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-100 group-hover:text-white truncate">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ev.games?.name} Â· {ev.platform}</p>
                    </div>
                    <p className="text-xs text-slate-400 ml-3 shrink-0">
                      {format(new Date(ev.event_date), 'MMM d')}
                    </p>
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
            <Link href="/teams" className="text-sm text-accent hover:text-accent-hover">View all â†’</Link>
          </div>
          <div className="space-y-3">
            {recentTeams && recentTeams.length > 0 ? (
              recentTeams.map((t: any) => (
                <Link key={t.id} href={`/teams/${t.id}`} className="card hover:border-accent/30 transition-all block group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-100 group-hover:text-white truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{t.games?.name ?? 'Cross-game'}</p>
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
    </div>
  )
}
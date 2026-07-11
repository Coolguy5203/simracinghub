import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Users, History } from 'lucide-react'
import { format } from 'date-fns'
import { gameTheme } from '@/lib/games'

export const metadata = { title: 'Events' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { game?: string; when?: string }
}) {
  const supabase = createClient()
  const showPast = searchParams.when === 'past'
  const now = new Date().toISOString()

  let query = supabase
    .from('srh_events')
    .select(`id, title, description, event_date, platform, max_participants,
             games:srh_games!inner(id, name, slug),
             event_rsvps:srh_event_rsvps(id)`)

  if (searchParams.game) {
    query = query.eq('games.slug', searchParams.game)
  }

  if (showPast) {
    query = query.lt('event_date', now).order('event_date', { ascending: false }).limit(30)
  } else {
    query = query.gte('event_date', now).order('event_date', { ascending: true })
  }

  const [{ data: events }, { data: games }] = await Promise.all([
    query,
    supabase.from('srh_games').select('id, name, slug').order('name'),
  ])

  const filterHref = (game?: string, when?: string) => {
    const params = new URLSearchParams()
    if (game) params.set('game', game)
    if (when) params.set('when', when)
    const qs = params.toString()
    return qs ? `/events?${qs}` : '/events'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="text-accent" size={24} /> {showPast ? 'Past Events' : 'Upcoming Events'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Find races and community events across all titles</p>
        </div>
        <Link href="/events/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Post Event
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Link
            href={filterHref(undefined, searchParams.when)}
            className={`badge px-3 py-1.5 rounded-lg text-sm ${!searchParams.game ? 'bg-accent text-white' : 'bg-surface-2 text-slate-400 hover:bg-surface-3'}`}
          >
            All Games
          </Link>
          {games?.map((g: any) => (
            <Link
              key={g.slug}
              href={filterHref(g.slug, searchParams.when)}
              className={`badge px-3 py-1.5 rounded-lg text-sm ${searchParams.game === g.slug ? 'bg-accent text-white' : 'bg-surface-2 text-slate-400 hover:bg-surface-3'}`}
            >
              {g.name}
            </Link>
          ))}
        </div>
        <Link
          href={filterHref(searchParams.game, showPast ? undefined : 'past')}
          className="badge px-3 py-1.5 rounded-lg text-sm bg-surface-2 text-slate-400 hover:bg-surface-3 flex items-center gap-1.5"
        >
          <History size={12} /> {showPast ? 'Show upcoming' : 'Show past'}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map((ev: any) => {
          const theme = gameTheme(ev.games?.slug)
          return (
            <Link key={ev.id} href={`/events/${ev.id}`} className={`card card-hover group block ${showPast ? 'opacity-70 hover:opacity-100' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium mb-1 ${theme.text}`}>{ev.games?.name}</p>
                  <h3 className="font-semibold text-slate-100 group-hover:text-white">{ev.title}</h3>
                </div>
                <span className={`badge ml-2 shrink-0 ${ev.platform === 'PC' ? 'bg-blue-900/50 text-blue-300' : ev.platform === 'Console' ? 'bg-purple-900/50 text-purple-300' : 'bg-surface-3 text-slate-400'}`}>
                  {ev.platform}
                </span>
              </div>

              {ev.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{ev.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {format(new Date(ev.event_date), 'MMM d, yyyy · HH:mm')}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {ev.event_rsvps?.length ?? 0}
                  {ev.max_participants && `/${ev.max_participants}`}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {(!events || events.length === 0) && (
        <div className="card text-center py-16 text-slate-500">
          <Calendar size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">{showPast ? 'No past events' : 'No upcoming events'}</p>
          {!showPast && (
            <p className="text-sm mt-1">
              <Link href="/events/new" className="text-accent hover:underline">Post the first event</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

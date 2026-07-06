import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, ExternalLink, Users } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = { title: 'Events' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { game?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('srh_events')
    .select(`id, title, description, event_date, platform, max_participants, games:srh_games(id, name, slug),
             event_rsvps:srh_event_rsvps(id)`)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  const { data: events } = await query

  const { data: games } = await supabase.from('srh_games').select('id, name, slug').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="text-accent" size={24} /> Upcoming Events
          </h1>
          <p className="text-slate-400 text-sm mt-1">Find races and community events across all titles</p>
        </div>
        <Link href="/events/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Post Event
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/events"
          className={`badge px-3 py-1.5 rounded-lg text-sm ${!searchParams.game ? 'bg-accent text-white' : 'bg-surface-2 text-slate-400 hover:bg-surface-3'}`}
        >
          All Games
        </Link>
        {games?.map((g: any) => (
          <Link
            key={g.slug}
            href={`/events?game=${g.slug}`}
            className={`badge px-3 py-1.5 rounded-lg text-sm ${searchParams.game === g.slug ? 'bg-accent text-white' : 'bg-surface-2 text-slate-400 hover:bg-surface-3'}`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events && events
          .filter((ev: any) => !searchParams.game || ev.games?.slug === searchParams.game)
          .map((ev: any) => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="card hover:border-accent/30 transition-all group block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-accent font-medium mb-1">{ev.games?.name}</p>
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
                  {format(new Date(ev.event_date), 'MMM d, yyyy Â· HH:mm')}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {ev.event_rsvps?.length ?? 0}
                  {ev.max_participants && `/${ev.max_participants}`}
                </span>
              </div>
            </Link>
          ))}
      </div>

      {(!events || events.filter((ev: any) => !searchParams.game || ev.games?.slug === searchParams.game).length === 0) && (
        <div className="card text-center py-16 text-slate-500">
          <Calendar size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">No upcoming events</p>
          <p className="text-sm mt-1">
            <Link href="/events/new" className="text-accent hover:underline">Post the first event</Link>
          </p>
        </div>
      )}
    </div>
  )
}
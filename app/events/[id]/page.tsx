import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, ExternalLink, Monitor, CalendarPlus } from 'lucide-react'
import { format, addHours } from 'date-fns'
import { RSVPButton } from '@/components/RSVPButton'
import { DeleteEventButton } from '@/components/DeleteEventButton'
import { Countdown } from '@/components/Countdown'
import { Avatar } from '@/components/Avatar'
import { gameTheme } from '@/lib/games'

interface Props { params: { id: string } }

function googleCalendarUrl(event: { title: string; description?: string | null; event_date: string; server_info?: string | null }) {
  const start = new Date(event.event_date)
  const end = addHours(start, 2)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🏁 ${event.title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: [event.description, event.server_info && `Server: ${event.server_info}`].filter(Boolean).join('\n\n') || 'SimRacer Hub event',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('srh_events')
    .select(`*, games:srh_games(id, name, slug), profiles:srh_profiles(username)`)
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: rsvps } = await supabase
    .from('srh_event_rsvps')
    .select('id, user_id, profiles:srh_profiles(username)')
    .eq('event_id', params.id)

  const userRsvp = rsvps?.find((r: any) => r.user_id === user?.id)
  const isFull = event.max_participants != null && (rsvps?.length ?? 0) >= event.max_participants
  const theme = gameTheme(event.games?.slug)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/events" className="text-sm text-slate-500 hover:text-slate-300">← Events</Link>
        {event.games && (
          <Link href={`/games/${event.games.slug}`} className="text-sm text-slate-500 hover:text-slate-300 ml-3">
            / {event.games.name}
          </Link>
        )}
      </div>

      <div className={`card space-y-5 bg-gradient-to-br ${theme.gradient}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {event.games && (
              <Link href={`/games/${event.games.slug}`} className={`text-xs font-medium ${theme.text}`}>{event.games.name}</Link>
            )}
            <h1 className="text-2xl font-bold text-slate-100 mt-1">{event.title}</h1>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              Posted by
              {event.profiles?.username ? (
                <Link href={`/u/${event.profiles.username}`} className="flex items-center gap-1 text-slate-300 hover:text-accent">
                  <Avatar username={event.profiles.username} size="xs" /> {event.profiles.username}
                </Link>
              ) : (
                <span className="text-slate-300">unknown</span>
              )}
            </p>
          </div>
          <span className={`badge shrink-0 ${event.platform === 'PC' ? 'bg-blue-900/50 text-blue-300' : event.platform === 'Console' ? 'bg-purple-900/50 text-purple-300' : 'bg-surface-3 text-slate-400'}`}>
            {event.platform}
          </span>
        </div>

        {/* Countdown */}
        <Countdown target={event.event_date} />

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar size={14} className="text-accent shrink-0" />
            {format(new Date(event.event_date), "EEEE, MMMM d, yyyy 'at' HH:mm")}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={14} className="text-accent shrink-0" />
            {rsvps?.length ?? 0}{event.max_participants ? ` / ${event.max_participants}` : ''} participants
          </div>
          {event.server_info && (
            <div className="flex items-center gap-2 text-slate-300 sm:col-span-2">
              <Monitor size={14} className="text-accent shrink-0" />
              {event.server_info}
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-slate-300 leading-relaxed">{event.description}</p>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          {event.external_link && (
            <a
              href={event.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <ExternalLink size={14} /> Event link
            </a>
          )}
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <CalendarPlus size={14} /> Add to Google Calendar
          </a>
        </div>

        {/* RSVP */}
        {user ? (
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <RSVPButton
              eventId={event.id}
              userId={user.id}
              hasRsvp={!!userRsvp}
              rsvpId={userRsvp?.id}
              isFull={isFull && !userRsvp}
            />
            {event.created_by === user.id && (
              <DeleteEventButton eventId={event.id} />
            )}
          </div>
        ) : (
          <div className="pt-3 border-t border-border">
            <Link href="/login" className="btn-secondary text-sm">Sign in to RSVP</Link>
          </div>
        )}
      </div>

      {/* Grid — who's racing */}
      {rsvps && rsvps.length > 0 && (
        <div className="card">
          <h2 className="section-title">Starting Grid ({rsvps.length})</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {rsvps.map((r: any, i: number) => (
              <Link
                key={r.id}
                href={`/u/${r.profiles?.username}`}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors group"
              >
                <span className="text-xs font-mono text-slate-600 w-6 text-right shrink-0">P{i + 1}</span>
                <Avatar username={r.profiles?.username ?? '??'} size="sm" />
                <span className="text-sm text-slate-300 group-hover:text-white truncate">{r.profiles?.username}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

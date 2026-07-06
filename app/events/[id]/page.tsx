import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, ExternalLink, MapPin, Monitor } from 'lucide-react'
import { format } from 'date-fns'
import { RSVPButton } from '@/components/RSVPButton'
import { DeleteEventButton } from '@/components/DeleteEventButton'

interface Props { params: { id: string } }

export default async function EventDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select(`*, games(id, name, slug), profiles(username)`)
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('id, user_id, profiles(username)')
    .eq('event_id', params.id)

  const userRsvp = rsvps?.find((r: any) => r.user_id === user?.id)
  const isFull = event.max_participants != null && (rsvps?.length ?? 0) >= event.max_participants

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

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {event.games && (
              <Link href={`/games/${event.games.slug}`} className="text-xs text-accent font-medium">{event.games.name}</Link>
            )}
            <h1 className="text-2xl font-bold text-slate-100 mt-1">{event.title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Posted by <span className="text-slate-300">{event.profiles?.username}</span>
            </p>
          </div>
          <span className={`badge shrink-0 ${event.platform === 'PC' ? 'bg-blue-900/50 text-blue-300' : event.platform === 'Console' ? 'bg-purple-900/50 text-purple-300' : 'bg-surface-3 text-slate-400'}`}>
            {event.platform}
          </span>
        </div>

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

        {event.external_link && (
          <a
            href={event.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <ExternalLink size={14} /> {event.external_link}
          </a>
        )}

        {/* RSVP */}
        {user ? (
          <div className="flex items-center gap-3 pt-2 border-t border-border">
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
          <div className="pt-2 border-t border-border">
            <Link href="/login" className="btn-secondary text-sm">Sign in to RSVP</Link>
          </div>
        )}
      </div>

      {/* RSVP list */}
      {rsvps && rsvps.length > 0 && (
        <div className="card">
          <h2 className="section-title">Participants ({rsvps.length})</h2>
          <div className="flex flex-wrap gap-2">
            {rsvps.map((r: any) => (
              <span key={r.id} className="badge bg-surface-2 text-slate-300 px-3 py-1 rounded-full text-sm">
                {r.profiles?.username}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

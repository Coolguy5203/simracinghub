import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Star, Plus, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data: game } = await supabase.from('games').select('name').eq('slug', params.slug).single()
  return { title: game?.name ?? 'Game' }
}

export default async function GamePage({ params }: Props) {
  const supabase = createClient()

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!game) notFound()

  const now = new Date().toISOString()

  const [{ data: events }, { data: teams }, { data: updates }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, event_date, platform')
      .eq('game_id', game.id)
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(5),
    supabase
      .from('teams')
      .select('id, name, description')
      .eq('game_id', game.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('game_updates')
      .select(`
        id, version, release_date, summary,
        update_ratings(rating)
      `)
      .eq('game_id', game.id)
      .order('release_date', { ascending: false })
      .limit(5),
  ])

  const avgRating = (ratings: { rating: number }[]) => {
    if (!ratings.length) return null
    return (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card bg-gradient-to-r from-accent/10 to-surface-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{game.name}</h1>
            {game.description && (
              <p className="text-slate-400 mt-2 max-w-2xl">{game.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <span className="badge bg-surface-3 text-slate-300">{game.platform}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Events */}
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 font-semibold text-slate-100">
              <Calendar size={16} className="text-accent" /> Events
            </h2>
            <Link href={`/events/new?game=${game.id}`} className="btn-ghost text-xs flex items-center gap-1">
              <Plus size={12} /> Add
            </Link>
          </div>
          <div className="space-y-2">
            {events && events.length > 0 ? events.map((ev: any) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="card hover:border-accent/30 transition-all block group p-3">
                <p className="text-sm font-medium text-slate-100 group-hover:text-white">{ev.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {format(new Date(ev.event_date), 'MMM d, HH:mm')} · {ev.platform}
                </p>
              </Link>
            )) : (
              <div className="card text-center text-slate-500 text-sm py-6">
                No upcoming events.{' '}
                <Link href={`/events/new?game=${game.id}`} className="text-accent hover:underline">Create one</Link>
              </div>
            )}
          </div>
          {events && events.length > 0 && (
            <Link href={`/events?game=${game.slug}`} className="text-xs text-accent hover:underline mt-2 block text-right">
              View all events →
            </Link>
          )}
        </section>

        {/* Teams */}
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 font-semibold text-slate-100">
              <Users size={16} className="text-accent" /> Teams
            </h2>
            <Link href={`/teams/new?game=${game.id}`} className="btn-ghost text-xs flex items-center gap-1">
              <Plus size={12} /> Create
            </Link>
          </div>
          <div className="space-y-2">
            {teams && teams.length > 0 ? teams.map((t: any) => (
              <Link key={t.id} href={`/teams/${t.id}`} className="card hover:border-accent/30 transition-all block group p-3">
                <p className="text-sm font-medium text-slate-100 group-hover:text-white">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                )}
              </Link>
            )) : (
              <div className="card text-center text-slate-500 text-sm py-6">
                No teams yet.{' '}
                <Link href={`/teams/new?game=${game.id}`} className="text-accent hover:underline">Start one</Link>
              </div>
            )}
          </div>
        </section>

        {/* Updates & Ratings */}
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 font-semibold text-slate-100">
              <Star size={16} className="text-accent" /> Update Ratings
            </h2>
            <Link href={`/games/${params.slug}/updates`} className="btn-ghost text-xs">View all</Link>
          </div>
          <div className="space-y-2">
            {updates && updates.length > 0 ? updates.map((u: any) => {
              const avg = avgRating(u.update_ratings ?? [])
              return (
                <Link key={u.id} href={`/games/${params.slug}/updates/${u.id}`} className="card hover:border-accent/30 transition-all block group p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-100 group-hover:text-white">{u.version}</p>
                    {avg && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                        <Star size={11} fill="currentColor" /> {avg}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(u.release_date), 'MMM d, yyyy')}
                    {u.update_ratings?.length > 0 && ` · ${u.update_ratings.length} review${u.update_ratings.length !== 1 ? 's' : ''}`}
                  </p>
                </Link>
              )
            }) : (
              <div className="card text-center text-slate-500 text-sm py-6">
                No ratings yet.{' '}
                <Link href={`/games/${params.slug}/updates`} className="text-accent hover:underline">Add one</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

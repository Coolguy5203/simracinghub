import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Star, Plus, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { gameTheme } from '@/lib/games'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data: game } = await supabase.from('srh_games').select('name').eq('slug', params.slug).single()
  return { title: game?.name ?? 'Game' }
}

export default async function GamePage({ params }: Props) {
  const supabase = createClient()

  const { data: game } = await supabase
    .from('srh_games')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!game) notFound()

  const now = new Date().toISOString()

  const [{ data: events }, { data: updates }] = await Promise.all([
    supabase
      .from('srh_events')
      .select('id, title, event_date, platform')
      .eq('game_id', game.id)
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(5),
    supabase
      .from('srh_game_updates')
      .select(`
        id, version, release_date, summary,
        update_ratings:srh_update_ratings(rating)
      `)
      .eq('game_id', game.id)
      .order('release_date', { ascending: false })
      .limit(5),
  ])

  const avgRating = (ratings: { rating: number }[]) => {
    if (!ratings.length) return null
    return (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
  }

  const theme = gameTheme(params.slug)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`card relative overflow-hidden bg-gradient-to-r ${theme.gradient}`}>
        <div className="absolute inset-0 checkered opacity-40" />
        <div className="relative flex items-center gap-5">
          <span className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${theme.solid} text-white font-bold text-lg sm:text-xl shrink-0 shadow-xl ${theme.glow}`}>
            {theme.monogram}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{game.name}</h1>
            {game.description && (
              <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">{game.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <span className="badge bg-surface-3 text-slate-300">{game.platform}</span>
              {game.legacy && (
                <span className="badge bg-surface-3 text-slate-500">Legacy title</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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

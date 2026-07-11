import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Star, Flag, Gauge, Settings } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { Avatar } from '@/components/Avatar'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props) {
  return { title: `${params.username} — Driver Profile` }
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('srh_profiles')
    .select('id, username, bio, created_at')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id
  const now = new Date().toISOString()

  const [
    { count: eventsCreated },
    { data: attending },
    { data: reviews },
    { count: reviewCount },
  ] = await Promise.all([
    supabase
      .from('srh_events')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', profile.id),
    supabase
      .from('srh_event_rsvps')
      .select('id, events:srh_events!inner(id, title, event_date, platform, games:srh_games(name, slug))')
      .eq('user_id', profile.id)
      .gte('events.event_date', now)
      .limit(5)
      .then(res => ({
        ...res,
        data: res.data?.sort((a: any, b: any) => a.events.event_date.localeCompare(b.events.event_date)) ?? null,
      })),
    supabase
      .from('srh_update_ratings')
      .select('id, rating, review, created_at, updates:srh_game_updates(id, version, game_id, games:srh_games(name, slug))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('srh_update_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
  ])

  const stats = [
    { icon: Calendar, label: 'Events posted', value: eventsCreated ?? 0 },
    { icon: Gauge, label: 'Racing soon', value: attending?.length ?? 0 },
    { icon: Star, label: 'Reviews', value: reviewCount ?? 0 },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 checkered opacity-50" />
        <div className="relative flex items-center gap-5">
          <Avatar username={profile.username} size="xl" className="ring-4 ring-surface-2" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              {profile.username}
              <Flag size={16} className="text-accent" />
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Racing since {format(new Date(profile.created_at), 'MMMM yyyy')}
            </p>
            {profile.bio && <p className="text-slate-300 mt-2 text-sm">{profile.bio}</p>}
          </div>
          {isOwnProfile && (
            <Link href="/settings" className="btn-secondary text-sm flex items-center gap-1.5 shrink-0">
              <Settings size={14} /> Edit
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center py-4">
            <Icon size={16} className="text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-100 font-mono">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming races */}
      {attending && attending.length > 0 && (
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <Calendar size={16} className="text-accent" /> Racing Soon
          </h2>
          <div className="space-y-2">
            {attending.map((r: any) => (
              <Link key={r.id} href={`/events/${r.events.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{r.events.title}</p>
                  <p className="text-xs text-slate-500">{r.events.games?.name} · {r.events.platform}</p>
                </div>
                <span className="text-xs text-accent font-medium ml-3 shrink-0">
                  {format(new Date(r.events.event_date), 'MMM d, HH:mm')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2">
          <Star size={16} className="text-accent" /> Recent Reviews
        </h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/games/${r.updates?.games?.slug}/updates/${r.updates?.id}`}
                    className="text-sm font-medium text-slate-200 hover:text-accent"
                  >
                    {r.updates?.games?.name} — {r.updates?.version}
                  </Link>
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill={i < r.rating ? 'currentColor' : 'none'} className={i < r.rating ? '' : 'text-slate-600'} />
                    ))}
                  </span>
                </div>
                {r.review && <p className="text-sm text-slate-400">{r.review}</p>}
                <p className="text-xs text-slate-600 mt-1">
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}

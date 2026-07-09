import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { RatingForm } from '@/components/RatingForm'
import { Avatar } from '@/components/Avatar'
import { gameTheme } from '@/lib/games'

interface Props { params: { slug: string; updateId: string } }

export default async function UpdateDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: game } = await supabase.from('srh_games').select('*').eq('slug', params.slug).single()
  if (!game) notFound()

  const { data: update } = await supabase
    .from('srh_game_updates')
    .select('*')
    .eq('id', params.updateId)
    .eq('game_id', game.id)
    .single()
  if (!update) notFound()

  const { data: ratings } = await supabase
    .from('srh_update_ratings')
    .select(`id, rating, review, created_at, profiles:srh_profiles(username)`)
    .eq('update_id', params.updateId)
    .order('created_at', { ascending: false })

  let userRating = null
  if (user) {
    const { data } = await supabase
      .from('srh_update_ratings')
      .select('*')
      .eq('update_id', params.updateId)
      .eq('user_id', user.id)
      .maybeSingle()
    userRating = data
  }

  const count = ratings?.length ?? 0
  const avgRating = count > 0
    ? (ratings!.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
    : null

  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    n: (ratings ?? []).filter(r => r.rating === star).length,
  }))

  const theme = gameTheme(params.slug)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/games/${params.slug}/updates`} className="text-sm text-slate-500 hover:text-slate-300">
          ← Back to updates
        </Link>
        <div className={`card mt-3 bg-gradient-to-br ${theme.gradient}`}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium mb-1 ${theme.text}`}>{game.name}</p>
              <h1 className="text-2xl font-bold text-slate-100">{update.version}</h1>
              <p className="text-sm text-slate-400 mt-1">
                Released {format(new Date(update.release_date), 'MMMM d, yyyy')}
              </p>
              {update.summary && <p className="text-slate-300 mt-3">{update.summary}</p>}
            </div>
            <div className="text-right shrink-0">
              {avgRating ? (
                <>
                  <div className="flex items-center gap-1 text-yellow-400 text-3xl font-bold justify-end">
                    <Star size={24} fill="currentColor" /> {avgRating}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{count} review{count !== 1 ? 's' : ''}</p>
                </>
              ) : (
                <p className="text-slate-500 text-sm">No ratings yet</p>
              )}
            </div>
          </div>

          {/* Rating distribution */}
          {count > 0 && (
            <div className="mt-5 pt-4 border-t border-border/50 space-y-1.5 max-w-sm">
              {dist.map(({ star, n }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-3 text-right">{star}</span>
                  <Star size={10} className="text-yellow-400" fill="currentColor" />
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
                      style={{ width: `${(n / count) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6">{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating form */}
      {user ? (
        <RatingForm
          updateId={params.updateId}
          existingRating={userRating}
          gameSlug={params.slug}
        />
      ) : (
        <div className="card text-center text-sm text-slate-400 py-6">
          <Link href="/login" className="text-accent hover:underline">Sign in</Link> to leave a rating.
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="section-title">Reviews</h2>
        <div className="space-y-3">
          {ratings && ratings.length > 0 ? ratings.map((r: any) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/u/${r.profiles?.username}`} className="flex items-center gap-2 group">
                  <Avatar username={r.profiles?.username ?? '??'} size="sm" />
                  <span className="font-medium text-slate-200 text-sm group-hover:text-accent transition-colors">
                    {r.profiles?.username}
                  </span>
                </Link>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={12} className={i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                  ))}
                </div>
              </div>
              {r.review && <p className="text-sm text-slate-400">{r.review}</p>}
              <p className="text-xs text-slate-600 mt-2">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
            </div>
          )) : (
            <div className="card text-center text-slate-500 text-sm py-8">
              No reviews yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

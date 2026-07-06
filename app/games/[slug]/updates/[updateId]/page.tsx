import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { RatingForm } from '@/components/RatingForm'

interface Props { params: { slug: string; updateId: string } }

export default async function UpdateDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: game } = await supabase.from('games').select('*').eq('slug', params.slug).single()
  if (!game) notFound()

  const { data: update } = await supabase
    .from('game_updates')
    .select('*')
    .eq('id', params.updateId)
    .eq('game_id', game.id)
    .single()
  if (!update) notFound()

  const { data: ratings } = await supabase
    .from('update_ratings')
    .select(`id, rating, review, created_at, profiles(username)`)
    .eq('update_id', params.updateId)
    .order('created_at', { ascending: false })

  let userRating = null
  if (user) {
    const { data } = await supabase
      .from('update_ratings')
      .select('*')
      .eq('update_id', params.updateId)
      .eq('user_id', user.id)
      .maybeSingle()
    userRating = data
  }

  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/games/${params.slug}/updates`} className="text-sm text-slate-500 hover:text-slate-300">
          ← Back to updates
        </Link>
        <div className="card mt-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">{game.name}</p>
              <h1 className="text-2xl font-bold text-slate-100">{update.version}</h1>
              <p className="text-sm text-slate-400 mt-1">
                Released {format(new Date(update.release_date), 'MMMM d, yyyy')}
              </p>
              {update.summary && <p className="text-slate-300 mt-3">{update.summary}</p>}
            </div>
            <div className="text-right ml-6 shrink-0">
              {avgRating ? (
                <>
                  <div className="flex items-center gap-1 text-yellow-400 text-3xl font-bold">
                    <Star size={24} fill="currentColor" /> {avgRating}
                  </div>
                  <p className="text-xs text-slate-500">{ratings?.length} review{ratings?.length !== 1 ? 's' : ''}</p>
                </>
              ) : (
                <p className="text-slate-500 text-sm">No ratings yet</p>
              )}
            </div>
          </div>
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
                <span className="font-medium text-slate-200 text-sm">{r.profiles?.username}</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
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

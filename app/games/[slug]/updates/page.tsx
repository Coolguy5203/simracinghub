import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { AddUpdateForm } from '@/components/AddUpdateForm'

interface Props { params: { slug: string } }

export const metadata = { title: 'Update Ratings' }

export default async function UpdatesPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: game } = await supabase.from('games').select('*').eq('slug', params.slug).single()
  if (!game) notFound()

  const { data: updates } = await supabase
    .from('game_updates')
    .select(`id, version, release_date, summary, update_ratings(rating)`)
    .eq('game_id', game.id)
    .order('release_date', { ascending: false })

  const avgRating = (ratings: { rating: number }[]) => {
    if (!ratings?.length) return null
    return (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/games/${params.slug}`} className="text-sm text-slate-500 hover:text-slate-300">
            ← {game.name}
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">Update Ratings</h1>
        </div>
      </div>

      {user && <AddUpdateForm gameId={game.id} gameSlug={params.slug} />}

      <div className="space-y-3">
        {updates && updates.length > 0 ? updates.map((u: any) => {
          const avg = avgRating(u.update_ratings)
          const count = u.update_ratings?.length ?? 0
          return (
            <Link
              key={u.id}
              href={`/games/${params.slug}/updates/${u.id}`}
              className="card hover:border-accent/30 transition-all block group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100 group-hover:text-white">{u.version}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Released {format(new Date(u.release_date), 'MMMM d, yyyy')}
                  </p>
                  {u.summary && <p className="text-sm text-slate-400 mt-1">{u.summary}</p>}
                </div>
                <div className="text-right ml-4 shrink-0">
                  {avg ? (
                    <div className="flex items-center gap-1 text-yellow-400 text-lg font-bold">
                      <Star size={16} fill="currentColor" /> {avg}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">No ratings</span>
                  )}
                  {count > 0 && <p className="text-xs text-slate-500">{count} review{count !== 1 ? 's' : ''}</p>}
                </div>
              </div>
            </Link>
          )
        }) : (
          <div className="card text-center py-12 text-slate-500">
            <Star size={32} className="mx-auto mb-3 opacity-30" />
            <p>No updates rated yet.</p>
            {user && <p className="text-sm mt-1">Be the first to add a game update above.</p>}
            {!user && (
              <p className="text-sm mt-1">
                <Link href="/login" className="text-accent hover:underline">Sign in</Link> to add update ratings.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

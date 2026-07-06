'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, AlertCircle } from 'lucide-react'

interface Props {
  updateId: string
  existingRating: { id: string; rating: number; review: string | null } | null
  gameSlug: string
}

export function RatingForm({ updateId, existingRating, gameSlug }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState(0)
  const [rating, setRating] = useState(existingRating?.rating ?? 0)
  const [review, setReview] = useState(existingRating?.review ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating.'); return }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in.'); setLoading(false); return }

    if (existingRating) {
      await supabase.from('srh_update_ratings').update({ rating, review: review || null }).eq('id', existingRating.id)
    } else {
      await supabase.from('srh_update_ratings').insert({ update_id: updateId, user_id: user.id, rating, review: review || null })
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="section-title">{existingRating ? 'Update Your Rating' : 'Leave a Rating'}</h2>
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="flex items-center gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={i <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
            />
          </button>
        ))}
        <span className="ml-2 text-slate-400 text-sm">
          {rating ? ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][rating] : 'Select'}
        </span>
      </div>

      <div className="mb-4">
        <label className="label">Review (optional)</label>
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          className="w-full"
          rows={3}
          placeholder="What do you think of this update?"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? 'Saving…' : existingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  )
}

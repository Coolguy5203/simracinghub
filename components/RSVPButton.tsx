'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Plus } from 'lucide-react'

interface Props {
  eventId: string
  userId: string
  hasRsvp: boolean
  rsvpId?: string
  isFull: boolean
}

export function RSVPButton({ eventId, userId, hasRsvp, rsvpId, isFull }: Props) {
  const [loading, setLoading] = useState(false)
  const [optimistic, setOptimistic] = useState(hasRsvp)
  const router = useRouter()
  const supabase = createClient()

  const toggle = async () => {
    setLoading(true)
    if (optimistic) {
      setOptimistic(false)
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId)
    } else {
      setOptimistic(true)
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId })
    }
    setLoading(false)
    router.refresh()
  }

  if (isFull && !optimistic) {
    return <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed">Event Full</button>
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={optimistic ? 'btn-secondary text-sm flex items-center gap-2' : 'btn-primary text-sm flex items-center gap-2'}
    >
      {optimistic ? (
        <><CheckCircle size={14} /> Going (click to cancel)</>
      ) : (
        <><Plus size={14} /> RSVP</>
      )}
    </button>
  )
}

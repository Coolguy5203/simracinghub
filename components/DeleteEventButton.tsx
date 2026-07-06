'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setLoading(true)
    await supabase.from('srh_events').delete().eq('id', eventId)
    router.push('/events')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
    >
      <Trash2 size={14} /> {loading ? 'Deleting…' : 'Delete event'}
    </button>
  )
}

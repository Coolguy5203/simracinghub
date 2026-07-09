'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

export function RegenerateInviteButton({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const regenerate = async () => {
    if (!confirm('Generate a new invite code? The old code will stop working.')) return
    setLoading(true)
    await supabase.from('srh_teams').update({ invite_code: generateInviteCode() }).eq('id', teamId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={regenerate}
      disabled={loading}
      className="text-slate-500 hover:text-slate-200 transition-colors p-1"
      title="Generate new invite code"
    >
      <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
    </button>
  )
}

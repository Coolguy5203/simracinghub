'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoreHorizontal, UserMinus, ShieldCheck } from 'lucide-react'

interface Props {
  memberId: string
  teamId: string
  username: string
  currentRole: string
}

export function TeamManagePanel({ memberId, teamId, username, currentRole }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const remove = async () => {
    if (!confirm(`Remove ${username} from the team?`)) return
    setLoading(true)
    await supabase.from('team_members').delete().eq('id', memberId)
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  const toggleRole = async () => {
    const newRole = currentRole === 'owner' ? 'member' : 'owner'
    setLoading(true)
    await supabase.from('team_members').update({ role: newRole }).eq('id', memberId)
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="btn-ghost p-1" disabled={loading}>
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-2 border border-border rounded-xl shadow-xl py-1 z-50">
          <button
            onClick={toggleRole}
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-3 flex items-center gap-2"
          >
            <ShieldCheck size={13} />
            {currentRole === 'owner' ? 'Make member' : 'Make owner'}
          </button>
          <button
            onClick={remove}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-3 flex items-center gap-2"
          >
            <UserMinus size={13} /> Remove
          </button>
        </div>
      )}
    </div>
  )
}

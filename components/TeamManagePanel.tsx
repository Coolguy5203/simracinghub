'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoreHorizontal, UserMinus, ShieldCheck, Tag } from 'lucide-react'
import type { Rank } from '@/components/RankManager'

interface Props {
  memberId: string
  teamId: string
  username: string
  currentRole: string
  currentRankId: string | null
  ranks: Rank[]
}

export function TeamManagePanel({ memberId, teamId, username, currentRole, currentRankId, ranks }: Props) {
  const [open, setOpen] = useState(false)
  const [rankOpen, setRankOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const remove = async () => {
    if (!confirm(`Remove ${username} from the team?`)) return
    setLoading(true)
    await supabase.from('srh_team_members').delete().eq('id', memberId)
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  const toggleRole = async () => {
    const newRole = currentRole === 'owner' ? 'member' : 'owner'
    setLoading(true)
    await supabase.from('srh_team_members').update({ role: newRole }).eq('id', memberId)
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  const setRank = async (rankId: string | null) => {
    setLoading(true)
    await supabase.from('srh_team_members').update({ rank_id: rankId }).eq('id', memberId)
    setOpen(false)
    setRankOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); setRankOpen(false) }} className="btn-ghost p-1" disabled={loading}>
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setRankOpen(false) }} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface-2 border border-border rounded-xl shadow-xl py-1 z-50">
            {/* Rank submenu */}
            <button
              onClick={() => setRankOpen(o => !o)}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-3 flex items-center gap-2"
            >
              <Tag size={13} /> Set rank
            </button>
            {rankOpen && (
              <div className="border-t border-b border-border bg-surface-1/50 py-1 max-h-48 overflow-y-auto">
                {ranks.map(rank => (
                  <button
                    key={rank.id}
                    onClick={() => setRank(rank.id)}
                    className="w-full text-left px-6 py-1.5 text-sm hover:bg-surface-3 flex items-center gap-2"
                    style={{ color: rank.color }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: rank.color }} />
                    {rank.name}
                    {currentRankId === rank.id && <span className="ml-auto text-xs text-slate-500">✓</span>}
                  </button>
                ))}
                <button
                  onClick={() => setRank(null)}
                  className="w-full text-left px-6 py-1.5 text-sm text-slate-500 hover:bg-surface-3"
                >
                  No rank
                </button>
              </div>
            )}
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
        </>
      )}
    </div>
  )
}

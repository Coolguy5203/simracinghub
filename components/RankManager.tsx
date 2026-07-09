'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { RANK_COLORS } from '@/lib/teamColors'
import { Plus, Trash2, Shield, AlertCircle } from 'lucide-react'

export interface Rank {
  id: string
  name: string
  color: string
  position: number
}

interface Props {
  teamId: string
  ranks: Rank[]
}

export function RankManager({ teamId, ranks }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(RANK_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const addRank = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return
    if (ranks.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A rank with that name already exists.')
      return
    }
    setLoading(true)
    const position = ranks.length ? Math.max(...ranks.map(r => r.position)) + 1 : 0
    const { error: err } = await supabase
      .from('srh_team_ranks')
      .insert({ team_id: teamId, name: trimmed, color, position })
    if (err) {
      setError(err.message)
    } else {
      setName('')
    }
    setLoading(false)
    router.refresh()
  }

  const deleteRank = async (rank: Rank) => {
    if (!confirm(`Delete the "${rank.name}" rank? Members holding it will show no rank.`)) return
    setLoading(true)
    await supabase.from('srh_team_ranks').delete().eq('id', rank.id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-slate-100 flex items-center gap-2">
        <Shield size={16} className="text-accent" /> Ranks &amp; Driver Roles
      </h2>
      <p className="text-sm text-slate-400">
        Create custom ranks for your roster — driver roles, engineers, strategists, whatever your team runs.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Existing ranks */}
      <div className="space-y-2">
        {ranks.length === 0 && (
          <p className="text-sm text-slate-500">No ranks yet — add your first below.</p>
        )}
        {ranks.map(rank => (
          <div key={rank.id} className="flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2">
            <span
              className="badge font-medium"
              style={{ backgroundColor: `${rank.color}26`, color: rank.color, border: `1px solid ${rank.color}55` }}
            >
              {rank.name}
            </span>
            <button
              type="button"
              onClick={() => deleteRank(rank)}
              disabled={loading}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Delete rank"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add rank */}
      <form onSubmit={addRank} className="space-y-3 pt-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
            className="flex-1"
            placeholder="e.g. Endurance Driver, Setup Engineer, Strategist…"
          />
          <button type="submit" disabled={loading || !name.trim()} className="btn-primary text-sm flex items-center gap-1 shrink-0">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {RANK_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'w-6 h-6 rounded-full transition-all',
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-1 scale-110' : 'hover:scale-110'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </form>
    </div>
  )
}

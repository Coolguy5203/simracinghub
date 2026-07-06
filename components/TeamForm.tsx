'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface Props {
  games: { id: string; name: string }[]
  defaultGameId?: string
  userId: string
}

export function TeamForm({ games, defaultGameId, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    game_id: defaultGameId ?? '',
    name: '',
    description: '',
    announcements: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const invite_code = generateInviteCode()

    const { data: team, error: teamErr } = await supabase
      .from('srh_teams')
      .insert({
        name: form.name,
        description: form.description || null,
        game_id: form.game_id || null,
        invite_code,
        created_by: userId,
        announcements: form.announcements || null,
      })
      .select('id')
      .single()

    if (teamErr || !team) {
      setError(teamErr?.message ?? 'Failed to create team.')
      setLoading(false)
      return
    }

    // Add creator as owner
    await supabase.from('srh_team_members').insert({
      team_id: team.id,
      user_id: userId,
      role: 'owner',
    })

    router.push(`/teams/${team.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div>
        <label className="label">Team Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full" required placeholder="Apex Hunters Racing" />
      </div>

      <div>
        <label className="label">Game (optional — leave blank for cross-game team)</label>
        <select value={form.game_id} onChange={e => set('game_id', e.target.value)} className="w-full">
          <option value="">Cross-game / Any</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full" rows={3} placeholder="What's your team about? Competitive, casual, specific car class?" />
      </div>

      <div>
        <label className="label">Announcements / Internal Notes</label>
        <textarea value={form.announcements} onChange={e => set('announcements', e.target.value)} className="w-full" rows={2} placeholder="Visible to all team members" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating…' : 'Create Team'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

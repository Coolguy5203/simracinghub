'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Trash2 } from 'lucide-react'

interface Props {
  team: { id: string; name: string; description: string | null; game_id: string | null; announcements: string | null }
  games: { id: string; name: string }[]
}

export function TeamEditForm({ team, games }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: team.name,
    description: team.description ?? '',
    game_id: team.game_id ?? '',
    announcements: team.announcements ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.from('teams').update({
      name: form.name,
      description: form.description || null,
      game_id: form.game_id || null,
      announcements: form.announcements || null,
    }).eq('id', team.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/teams/${team.id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this team? This cannot be undone.')) return
    setLoading(true)
    await supabase.from('team_members').delete().eq('team_id', team.id)
    await supabase.from('teams').delete().eq('id', team.id)
    router.push('/teams')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="card space-y-5">
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div>
        <label className="label">Team Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full" required />
      </div>

      <div>
        <label className="label">Game</label>
        <select value={form.game_id} onChange={e => set('game_id', e.target.value)} className="w-full">
          <option value="">Cross-game / Any</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full" rows={3} />
      </div>

      <div>
        <label className="label">Announcements</label>
        <textarea value={form.announcements} onChange={e => set('announcements', e.target.value)} className="w-full" rows={3} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
        <button type="button" onClick={handleDelete} disabled={loading} className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
          <Trash2 size={14} /> Delete Team
        </button>
      </div>
    </form>
  )
}

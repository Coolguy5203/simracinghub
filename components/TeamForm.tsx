'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode, cn } from '@/lib/utils'
import { TEAM_COLORS } from '@/lib/teamColors'
import { AlertCircle, Check } from 'lucide-react'

interface Props {
  userId: string
}

export function TeamForm({ userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    tag: '',
    color: TEAM_COLORS[0].value,
    description: '',
    announcements: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.tag && !/^[A-Za-z0-9]{2,4}$/.test(form.tag)) {
      setError('Team tag must be 2–4 letters or numbers.')
      return
    }

    setLoading(true)
    const invite_code = generateInviteCode()

    // DB trigger adds the creator as owner and seeds default ranks
    const { data: team, error: teamErr } = await supabase
      .from('srh_teams')
      .insert({
        name: form.name,
        tag: form.tag ? form.tag.toUpperCase() : null,
        color: form.color,
        description: form.description || null,
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

      <p className="text-sm text-slate-400 bg-surface-2 border border-border rounded-lg px-3 py-2">
        Teams are <span className="text-slate-200 font-medium">cross-sim</span> — your roster carries over to every game you race.
      </p>

      <div className="grid sm:grid-cols-[1fr_8rem] gap-4">
        <div>
          <label className="label">Team Name *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full" required placeholder="Apex Hunters Racing" />
        </div>
        <div>
          <label className="label">Tag</label>
          <input
            type="text"
            value={form.tag}
            onChange={e => set('tag', e.target.value.toUpperCase())}
            className="w-full font-mono uppercase"
            maxLength={4}
            placeholder="APX"
          />
        </div>
      </div>

      <div>
        <label className="label">Livery Color</label>
        <div className="flex gap-2 flex-wrap">
          {TEAM_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => set('color', c.value)}
              className={cn(
                'w-8 h-8 rounded-full transition-all flex items-center justify-center',
                form.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-1 scale-110' : 'hover:scale-110'
              )}
              style={{ backgroundColor: c.value }}
            >
              {form.color === c.value && <Check size={14} className="text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full" rows={3} placeholder="What's your team about? Competitive, casual, endurance, specific car class?" />
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

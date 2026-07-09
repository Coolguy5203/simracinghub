'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { TEAM_COLORS } from '@/lib/teamColors'
import { AlertCircle, Trash2, Check } from 'lucide-react'

interface Props {
  team: {
    id: string
    name: string
    tag: string | null
    color: string | null
    description: string | null
    announcements: string | null
  }
}

export function TeamEditForm({ team }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: team.name,
    tag: team.tag ?? '',
    color: team.color ?? TEAM_COLORS[0].value,
    description: team.description ?? '',
    announcements: team.announcements ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.tag && !/^[A-Za-z0-9]{2,4}$/.test(form.tag)) {
      setError('Team tag must be 2–4 letters or numbers.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.from('srh_teams').update({
      name: form.name,
      tag: form.tag ? form.tag.toUpperCase() : null,
      color: form.color,
      description: form.description || null,
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
    await supabase.from('srh_teams').delete().eq('id', team.id)
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

      <div className="grid sm:grid-cols-[1fr_8rem] gap-4">
        <div>
          <label className="label">Team Name *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full" required />
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

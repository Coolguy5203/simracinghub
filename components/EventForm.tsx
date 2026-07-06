'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

interface Props {
  games: { id: string; name: string }[]
  defaultGameId?: string
  userId: string
}

const PLATFORMS = ['PC', 'Console', 'Both']

export function EventForm({ games, defaultGameId, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    game_id: defaultGameId ?? (games[0]?.id ?? ''),
    title: '',
    description: '',
    event_date: '',
    platform: 'PC',
    server_info: '',
    max_participants: '',
    external_link: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: err } = await supabase.from('srh_events').insert({
      game_id: form.game_id,
      created_by: userId,
      title: form.title,
      description: form.description || null,
      event_date: new Date(form.event_date).toISOString(),
      platform: form.platform,
      server_info: form.server_info || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      external_link: form.external_link || null,
    }).select('id').single()

    if (err || !data) {
      setError(err?.message ?? 'Failed to create event.')
      setLoading(false)
      return
    }

    router.push(`/events/${data.id}`)
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
        <label className="label">Game *</label>
        <select value={form.game_id} onChange={e => set('game_id', e.target.value)} className="w-full" required>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Event Title *</label>
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full" required placeholder="Sunday GT3 League Race" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full" rows={3} placeholder="Describe the event, rules, car class…" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Date & Time *</label>
          <input type="datetime-local" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="w-full" required />
        </div>
        <div>
          <label className="label">Platform</label>
          <select value={form.platform} onChange={e => set('platform', e.target.value)} className="w-full">
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Server / Lobby Info</label>
        <input type="text" value={form.server_info} onChange={e => set('server_info', e.target.value)} className="w-full" placeholder="Server password, room name, session ID…" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Max Participants</label>
          <input type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} className="w-full" min={1} placeholder="No limit" />
        </div>
        <div>
          <label className="label">External Link</label>
          <input type="url" value={form.external_link} onChange={e => set('external_link', e.target.value)} className="w-full" placeholder="https://discord.gg/…" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Posting…' : 'Post Event'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

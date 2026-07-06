'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  gameId: string
  gameSlug: string
}

export function AddUpdateForm({ gameId, gameSlug }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ version: '', release_date: '', summary: '' })
  const router = useRouter()
  const supabase = createClient()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in.'); setLoading(false); return }

    // Check duplicate
    const { data: existing } = await supabase
      .from('game_updates')
      .select('id')
      .eq('game_id', gameId)
      .eq('version', form.version.trim())
      .maybeSingle()

    if (existing) {
      setError('This version already exists for this game.')
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase
      .from('game_updates')
      .insert({
        game_id: gameId,
        version: form.version.trim(),
        release_date: form.release_date,
        summary: form.summary || null,
        added_by: user.id,
      })
      .select('id')
      .single()

    if (err || !data) {
      setError(err?.message ?? 'Failed to add update.')
      setLoading(false)
      return
    }

    router.push(`/games/${gameSlug}/updates/${data.id}`)
    router.refresh()
  }

  return (
    <div className="card bg-surface-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-medium text-slate-300 w-full text-left"
      >
        <Plus size={14} className="text-accent" /> Add a game update / patch
        {open ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Version / Patch Name *</label>
              <input type="text" value={form.version} onChange={e => set('version', e.target.value)} className="w-full" required placeholder="2026 S3 Build" />
            </div>
            <div>
              <label className="label">Release Date *</label>
              <input type="date" value={form.release_date} onChange={e => set('release_date', e.target.value)} className="w-full" required />
            </div>
          </div>

          <div>
            <label className="label">Summary</label>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)} className="w-full" rows={2} placeholder="Brief description of what changed…" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? 'Adding…' : 'Add Update'}
          </button>
        </form>
      )}
    </div>
  )
}

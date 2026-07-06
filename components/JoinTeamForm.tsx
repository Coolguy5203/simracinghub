'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function JoinTeamForm({ userId }: { userId: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { data: team } = await supabase
      .from('srh_teams')
      .select('id, name')
      .eq('invite_code', code.trim().toUpperCase())
      .single()

    if (!team) {
      setError('Invalid invite code.')
      setLoading(false)
      return
    }

    // Check already a member
    const { data: existing } = await supabase
      .from('srh_team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      setError('You are already a member of this team.')
      setLoading(false)
      return
    }

    await supabase.from('srh_team_members').insert({ team_id: team.id, user_id: userId, role: 'member' })
    setSuccess(`Joined "${team.name}"!`)
    setCode('')
    setTimeout(() => router.push(`/teams/${team.id}`), 1000)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="ABCD1234"
        className="font-mono flex-1"
        maxLength={8}
        required
      />
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? 'Joining…' : 'Join'}
      </button>
      {error && (
        <span className="flex items-center gap-1 text-red-400 text-sm self-center">
          <AlertCircle size={12} /> {error}
        </span>
      )}
      {success && (
        <span className="flex items-center gap-1 text-green-400 text-sm self-center">
          <CheckCircle size={12} /> {success}
        </span>
      )}
    </form>
  )
}

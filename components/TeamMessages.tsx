'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { Radio, Trash2, AlertCircle } from 'lucide-react'

export interface TeamMessage {
  id: string
  user_id: string
  body: string
  created_at: string
  profiles: { username: string } | null
}

interface Props {
  teamId: string
  messages: TeamMessage[]
  userId: string
  isOwner: boolean
  teamColor: string
}

export function TeamMessages({ teamId, messages, userId, isOwner, teamColor }: Props) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const post = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setError('')
    setLoading(true)
    const { error: err } = await supabase
      .from('srh_team_messages')
      .insert({ team_id: teamId, user_id: userId, body: body.trim() })
    if (err) {
      setError('Could not send — try again.')
      setLoading(false)
      return
    }
    setBody('')
    setLoading(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('srh_team_messages').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="card">
      <h2 className="section-title flex items-center gap-2">
        <Radio size={16} style={{ color: teamColor }} /> Team Radio
        <span className="text-xs font-normal text-slate-600">— private to the roster</span>
      </h2>

      <form onSubmit={post} className="space-y-2 mb-5">
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          className="w-full text-sm"
          placeholder="Message the team — strategy, schedules, results…"
        />
        <div className="flex justify-end">
          <button type="submit" disabled={loading || !body.trim()} className="btn-primary text-sm">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className="flex gap-3 group">
              <Link href={`/u/${m.profiles?.username}`} className="shrink-0 mt-0.5">
                <Avatar username={m.profiles?.username ?? '??'} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/u/${m.profiles?.username}`} className="text-sm font-medium text-slate-200 hover:text-accent">
                    {m.profiles?.username}
                  </Link>
                  <span className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words mt-0.5">{m.body}</p>
              </div>
              {(userId === m.user_id || isOwner) && (
                <button
                  onClick={() => remove(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all shrink-0 self-start mt-1"
                  title="Delete message"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Radio silence — send the first message.</p>
      )}
    </div>
  )
}

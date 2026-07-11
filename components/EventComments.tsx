'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Trash2, AlertCircle } from 'lucide-react'

export interface EventComment {
  id: string
  user_id: string
  body: string
  created_at: string
  profiles: { username: string } | null
}

interface Props {
  eventId: string
  comments: EventComment[]
  userId: string | null
  isHost: boolean
}

export function EventComments({ eventId, comments, userId, isHost }: Props) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const post = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !body.trim()) return
    setError('')
    setLoading(true)
    const { error: err } = await supabase
      .from('srh_event_comments')
      .insert({ event_id: eventId, user_id: userId, body: body.trim() })
    if (err) {
      setError('Could not post your comment — try again.')
      setLoading(false)
      return
    }
    setBody('')
    setLoading(false)
    router.refresh()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this comment?')) return
    await supabase.from('srh_event_comments').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="card">
      <h2 className="section-title flex items-center gap-2">
        <MessageSquare size={16} className="text-accent" /> Discussion ({comments.length})
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <Link href={`/u/${c.profiles?.username}`} className="shrink-0 mt-0.5">
                <Avatar username={c.profiles?.username ?? '??'} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/u/${c.profiles?.username}`} className="text-sm font-medium text-slate-200 hover:text-accent">
                    {c.profiles?.username}
                  </Link>
                  <span className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words mt-0.5">{c.body}</p>
              </div>
              {(userId === c.user_id || isHost) && (
                <button
                  onClick={() => remove(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all shrink-0 self-start mt-1"
                  title="Delete comment"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-5">No comments yet — kick off the conversation.</p>
      )}

      {userId ? (
        <form onSubmit={post} className="space-y-2">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            maxLength={1000}
            className="w-full text-sm"
            placeholder="Setup questions, server info, banter…"
          />
          <div className="flex justify-end">
            <button type="submit" disabled={loading || !body.trim()} className="btn-primary text-sm">
              {loading ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-500 border-t border-border pt-4">
          <Link href="/login" className="text-accent hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}
    </div>
  )
}

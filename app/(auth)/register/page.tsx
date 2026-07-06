'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { syntheticEmail } from '@/lib/utils'
import { Flag, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3–20 characters, letters/numbers/underscore only.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('srh_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      setError('That username is already taken.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: syntheticEmail(username),
      password,
      options: { emailRedirectTo: undefined },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Registration failed.')
      setLoading(false)
      return
    }

    // Create profile
    await supabase.from('srh_profiles').insert({
      id: data.user.id,
      username,
    })

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Flag className="text-accent mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-bold text-slate-100">Join SimRacer Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="cool_racer"
              className="w-full"
              required
              autoFocus
              autoComplete="username"
            />
            <p className="text-xs text-slate-500 mt-1">3–20 chars, letters/numbers/underscore</p>
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

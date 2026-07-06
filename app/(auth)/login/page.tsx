'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { syntheticEmail } from '@/lib/utils'
import { Flag, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail(username),
      password,
    })

    if (error) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Flag className="text-accent mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-bold text-slate-100">Sign in to SimRacer Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your username and password</p>
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
              placeholder="your_username"
              className="w-full"
              required
              autoFocus
              autoComplete="username"
            />
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-400">
            No account?{' '}
            <Link href="/register" className="text-accent hover:underline">Join the hub</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

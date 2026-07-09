'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import { AlertCircle, CheckCircle, KeyRound, User } from 'lucide-react'

interface Props {
  userId: string
  username: string
  initialBio: string
}

export function SettingsForm({ userId, username, initialBio }: Props) {
  const [bio, setBio] = useState(initialBio)
  const [bioStatus, setBioStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [pwError, setPwError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const saveBio = async (e: React.FormEvent) => {
    e.preventDefault()
    setBioStatus('saving')
    const { error } = await supabase
      .from('srh_profiles')
      .update({ bio: bio.trim() || null })
      .eq('id', userId)
    setBioStatus(error ? 'error' : 'saved')
    if (!error) {
      router.refresh()
      setTimeout(() => setBioStatus('idle'), 2000)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setPwStatus('saving')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwError(error.message)
      setPwStatus('idle')
      return
    }
    setPwStatus('saved')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPwStatus('idle'), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Profile section */}
      <form onSubmit={saveBio} className="card space-y-4">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          <User size={16} className="text-accent" /> Profile
        </h2>

        <div className="flex items-center gap-4">
          <Avatar username={username} size="lg" />
          <div>
            <p className="font-medium text-slate-200">{username}</p>
            <Link href={`/u/${username}`} className="text-xs text-accent hover:underline">
              View public profile →
            </Link>
          </div>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full"
            placeholder="Tell other racers about yourself — favorite sims, series, setups…"
          />
          <p className="text-xs text-slate-600 mt-1 text-right">{bio.length}/280</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={bioStatus === 'saving'} className="btn-primary text-sm">
            {bioStatus === 'saving' ? 'Saving…' : 'Save profile'}
          </button>
          {bioStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-400 text-sm animate-fade-in">
              <CheckCircle size={14} /> Saved
            </span>
          )}
          {bioStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle size={14} /> Failed to save
            </span>
          )}
        </div>
      </form>

      {/* Password section */}
      <form onSubmit={changePassword} className="card space-y-4">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          <KeyRound size={16} className="text-accent" /> Change Password
        </h2>

        {pwError && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
            <AlertCircle size={14} /> {pwError}
          </div>
        )}

        <div>
          <label className="label">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={pwStatus === 'saving' || !newPassword} className="btn-primary text-sm">
            {pwStatus === 'saving' ? 'Updating…' : 'Update password'}
          </button>
          {pwStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-400 text-sm animate-fade-in">
              <CheckCircle size={14} /> Password updated
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

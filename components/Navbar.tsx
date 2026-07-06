'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flag, Users, Calendar, Star, ChevronDown, Menu, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

const GAMES = [
  { name: 'iRacing', slug: 'iracing' },
  { name: 'ACC', slug: 'acc' },
  { name: 'rFactor 2', slug: 'rfactor2' },
  { name: 'Automobilista 2', slug: 'automobilista2' },
  { name: 'F1 24', slug: 'f1-24' },
  { name: 'Gran Turismo 7', slug: 'gran-turismo-7' },
  { name: 'RaceRoom', slug: 'raceroom' },
]

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [gamesOpen, setGamesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(data?.username ?? null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        setUsername(data?.username ?? null)
      } else {
        setUsername(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        pathname === href
          ? 'bg-surface-2 text-slate-100'
          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
      )}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 bg-surface-1/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Flag className="text-accent" size={20} />
            <span className="text-slate-100">SimRacer <span className="text-accent">Hub</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Games dropdown */}
            <div className="relative">
              <button
                onClick={() => setGamesOpen(o => !o)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-surface-2 transition-colors"
              >
                Games <ChevronDown size={14} className={cn('transition-transform', gamesOpen && 'rotate-180')} />
              </button>
              {gamesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-surface-2 border border-border rounded-xl shadow-xl py-1 z-50">
                  {GAMES.map(g => (
                    <Link
                      key={g.slug}
                      href={`/games/${g.slug}`}
                      onClick={() => setGamesOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-surface-3 transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navLink('/events', 'Events')}
            {navLink('/teams', 'Teams')}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-slate-400">
                  <span className="text-slate-200 font-medium">{username}</span>
                </span>
                <button onClick={handleSignOut} className="btn-ghost flex items-center gap-1 text-sm">
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm">Join</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-200"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface-1 px-4 py-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Games</p>
          {GAMES.map(g => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-slate-300 hover:bg-surface-2 rounded-lg"
            >
              {g.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 space-y-1">
            <Link href="/events" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-2 rounded-lg">
              <Calendar size={14} /> Events
            </Link>
            <Link href="/teams" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-2 rounded-lg">
              <Users size={14} /> Teams
            </Link>
          </div>
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-surface-2 rounded-lg flex items-center gap-2">
                <LogOut size={14} /> Sign out ({username})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn-secondary text-sm flex-1 text-center">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm flex-1 text-center">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

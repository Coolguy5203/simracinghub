'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flag, Calendar, Users, CircleUser } from 'lucide-react'
import { cn } from '@/lib/utils'

// App-style tab bar, phones only (hidden ≥ md). Safe-area padded for standalone PWA mode.
export function BottomNav() {
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('srh_profiles').select('username').eq('id', user.id).single()
      setUsername(data?.username ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) { setUsername(null); return }
      const { data } = await supabase.from('srh_profiles').select('username').eq('id', session.user.id).single()
      setUsername(data?.username ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const profileHref = username ? `/u/${username}` : '/login'
  const tabs = [
    { href: '/', label: 'Home', icon: Flag, active: pathname === '/' },
    { href: '/events', label: 'Events', icon: Calendar, active: pathname.startsWith('/events') },
    { href: '/teams', label: 'Teams', icon: Users, active: pathname.startsWith('/teams') },
    { href: profileHref, label: username ? 'Profile' : 'Sign in', icon: CircleUser, active: pathname.startsWith('/u/') || pathname === '/login' || pathname === '/settings' },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-1/95 backdrop-blur border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              active ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 2} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

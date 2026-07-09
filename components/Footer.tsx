import Link from 'next/link'
import { Flag } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Flag size={16} className="text-accent" />
            <span className="font-semibold text-slate-300">SimRacer <span className="text-accent">Hub</span></span>
            <span className="text-slate-600 text-sm">— built by racers, for racers</span>
          </div>
          <nav className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/events" className="hover:text-slate-300 transition-colors">Events</Link>
            <Link href="/teams" className="hover:text-slate-300 transition-colors">Teams</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Join</Link>
          </nav>
        </div>
        <div className="stripe mt-6" />
      </div>
    </footer>
  )
}

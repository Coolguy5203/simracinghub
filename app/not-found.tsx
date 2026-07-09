import Link from 'next/link'
import { Flag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-7xl font-bold font-mono text-accent">404</p>
        <h1 className="text-2xl font-bold text-slate-100">You&apos;ve gone off track</h1>
        <p className="text-slate-400 max-w-sm mx-auto">
          This page doesn&apos;t exist — looks like a wrong apex. Rejoin the racing line below.
        </p>
        <div className="stripe max-w-xs mx-auto" />
        <Link href="/" className="btn-primary inline-flex items-center gap-2 mt-2">
          <Flag size={16} /> Back to the pits
        </Link>
      </div>
    </div>
  )
}

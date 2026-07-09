'use client'

import { useEffect, useState } from 'react'

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000))
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

export function Countdown({ target, className }: { target: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Render nothing until mounted to avoid hydration mismatch
  if (now === null) return <div className={className} style={{ minHeight: '3.5rem' }} />

  const targetMs = new Date(target).getTime()
  const diff = targetMs - now

  // Within 3 hours after start: show LIVE. After that: finished.
  if (diff <= 0 && diff > -3 * 3600 * 1000) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-2 text-green-400 font-bold text-lg">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          LIVE NOW
        </span>
      </div>
    )
  }

  if (diff <= 0) {
    return (
      <div className={className}>
        <span className="text-slate-500 font-medium">🏁 Event finished</span>
      </div>
    )
  }

  const { d, h, m, s } = parts(diff)
  const cell = (value: number, label: string) => (
    <div className="flex flex-col items-center bg-surface-2 border border-border rounded-lg px-3 py-2 min-w-[3.5rem]">
      <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  )

  return (
    <div className={className}>
      <div className="flex gap-2">
        {d > 0 && cell(d, 'days')}
        {cell(h, 'hrs')}
        {cell(m, 'min')}
        {cell(s, 'sec')}
      </div>
    </div>
  )
}

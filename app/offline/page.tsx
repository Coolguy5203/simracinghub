import { WifiOff } from 'lucide-react'

export const metadata = { title: 'Offline' }

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <WifiOff size={48} className="mx-auto text-accent" />
        <h1 className="text-2xl font-bold text-slate-100">Connection lost</h1>
        <p className="text-slate-400 max-w-sm mx-auto">
          Looks like you dropped off the timing screens. Check your connection and try again — the pits will be waiting.
        </p>
        <div className="stripe max-w-xs mx-auto" />
      </div>
    </div>
  )
}

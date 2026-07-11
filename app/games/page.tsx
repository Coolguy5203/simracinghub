import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Flag, ChevronRight, Archive } from 'lucide-react'
import { gameTheme } from '@/lib/games'

export const metadata = { title: 'All Games' }

export default async function GamesIndexPage() {
  const supabase = createClient()

  const { data: games } = await supabase
    .from('srh_games')
    .select('id, name, slug, description, platform, legacy')
    .order('name')

  const current = games?.filter((g: any) => !g.legacy) ?? []
  const legacy = games?.filter((g: any) => g.legacy) ?? []

  const gameCard = (g: any, muted = false) => {
    const theme = gameTheme(g.slug)
    return (
      <Link
        key={g.slug}
        href={`/games/${g.slug}`}
        className={`card card-hover bg-gradient-to-br ${theme.gradient} group flex items-center gap-4 ${muted ? 'opacity-75 hover:opacity-100' : ''}`}
      >
        <span className={`flex items-center justify-center w-12 h-12 rounded-lg ${theme.solid} text-white font-bold text-xs shrink-0 shadow-lg ${theme.glow}`}>
          {theme.monogram}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 group-hover:text-white">{g.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{g.description}</p>
          <p className="text-xs text-slate-600 mt-0.5">{g.platform}</p>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
      </Link>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Flag className="text-accent" size={24} /> All Games
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Every title on the hub — post events, form teams, and rate updates for any of them.
        </p>
      </div>

      <section>
        <h2 className="section-title">Current Titles</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {current.map((g: any) => gameCard(g))}
        </div>
      </section>

      {legacy.length > 0 && (
        <section>
          <h2 className="section-title flex items-center gap-2">
            <Archive size={16} className="text-slate-500" /> Legacy Titles
          </h2>
          <p className="text-sm text-slate-500 -mt-2 mb-4">
            Older games the community still races. Everything works here too — events, teams, and update ratings.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {legacy.map((g: any) => gameCard(g, true))}
          </div>
        </section>
      )}
    </div>
  )
}

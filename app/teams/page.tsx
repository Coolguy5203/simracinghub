import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, Lock } from 'lucide-react'
import { JoinTeamForm } from '@/components/JoinTeamForm'

export const metadata = { title: 'Teams' }

export default async function TeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Teams with member count (only show names/descriptions, not private data)
  const { data: teams } = await supabase
    .from('srh_teams')
    .select(`id, name, description, games:srh_games(name, slug), team_members:srh_team_members(id)`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-accent" size={24} /> Teams
          </h1>
          <p className="text-slate-400 text-sm mt-1">Private invite-only teams across all titles</p>
        </div>
        {user && (
          <Link href="/teams/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Team
          </Link>
        )}
      </div>

      {user && (
        <div className="card bg-surface-2">
          <h2 className="font-semibold text-slate-200 text-sm mb-3 flex items-center gap-2">
            <Lock size={14} className="text-accent" /> Join a Team by Invite Code
          </h2>
          <JoinTeamForm userId={user.id} />
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((t: any) => (
          <div key={t.id} className="card group">
            <div className="flex items-start justify-between mb-2">
              <div>
                {t.games && (
                  <p className="text-xs text-accent mb-0.5">{t.games.name}</p>
                )}
                <h3 className="font-semibold text-slate-100">{t.name}</h3>
              </div>
              <Lock size={12} className="text-slate-600 shrink-0 mt-1" />
            </div>
            {t.description && (
              <p className="text-sm text-slate-400 line-clamp-2 mt-1">{t.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">
                {t.team_members?.length ?? 0} member{t.team_members?.length !== 1 ? 's' : ''}
              </span>
              {user && (
                <Link href={`/teams/${t.id}`} className="text-xs text-accent hover:underline">
                  View â†’
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {!teams?.length && (
        <div className="card text-center py-16 text-slate-500">
          <Users size={40} className="mx-auto mb-4 opacity-20" />
          <p>No teams yet.</p>
          {user ? (
            <Link href="/teams/new" className="text-accent hover:underline text-sm mt-1 block">Create the first team</Link>
          ) : (
            <p className="text-sm mt-1">
              <Link href="/login" className="text-accent hover:underline">Sign in</Link> to create or join a team.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
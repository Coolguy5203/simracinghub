import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, Lock, Cake } from 'lucide-react'
import { format } from 'date-fns'
import { JoinTeamForm } from '@/components/JoinTeamForm'

export const metadata = { title: 'Teams' }

export default async function TeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: teams }, { data: counts }] = await Promise.all([
    supabase
      .from('srh_teams')
      .select('id, name, tag, color, description, created_at')
      .order('created_at', { ascending: false }),
    // RLS hides roster rows from non-members, so counts come from a hardened aggregate fn
    supabase.rpc('srh_team_member_counts'),
  ])

  const memberCount = (teamId: string) =>
    (counts as any[])?.find(c => c.team_id === teamId)?.member_count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-accent" size={24} /> Teams
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Private invite-only teams — one roster that carries over to every sim you race
          </p>
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
        {teams?.map((t: any) => {
          const color = t.color ?? '#e8322a'
          return (
            <Link key={t.id} href={`/teams/${t.id}`} className="card card-hover group block overflow-hidden relative p-0">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-100 group-hover:text-white flex items-center gap-2 flex-wrap">
                    {t.tag && <span className="font-mono text-sm" style={{ color }}>[{t.tag}]</span>}
                    {t.name}
                  </h3>
                  <Lock size={12} className="text-slate-600 shrink-0 mt-1" />
                </div>
                {t.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1">{t.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Cake size={11} /> {format(new Date(t.created_at), 'MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {memberCount(t.id)} driver{memberCount(t.id) !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="badge" style={{ backgroundColor: `${color}1f`, color }}>Cross-sim</span>
                </div>
              </div>
            </Link>
          )
        })}
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

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Crown, Copy, FileText } from 'lucide-react'
import { TeamManagePanel } from '@/components/TeamManagePanel'

interface Props { params: { id: string } }

export default async function TeamPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: team } = await supabase
    .from('srh_teams')
    .select(`*, games:srh_games(name, slug)`)
    .eq('id', params.id)
    .single()

  if (!team) notFound()

  // Check membership — private team
  const { data: membership } = user
    ? await supabase
        .from('srh_team_members')
        .select('role')
        .eq('team_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  if (!membership) {
    // Not a member — show teaser
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <Users size={48} className="mx-auto text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-100">{team.name}</h1>
        {team.description && <p className="text-slate-400">{team.description}</p>}
        <div className="card bg-surface-2 text-sm text-slate-400 py-6">
          <p>This is a private team. You need an invite code to join.</p>
          {!user && (
            <p className="mt-2">
              <Link href="/login" className="text-accent hover:underline">Sign in</Link> first, then enter your invite code on the Teams page.
            </p>
          )}
        </div>
      </div>
    )
  }

  const { data: members } = await supabase
    .from('srh_team_members')
    .select('id, role, joined_at, user_id, profiles:srh_profiles(username)')
    .eq('team_id', params.id)
    .order('joined_at', { ascending: true })

  const isOwner = membership.role === 'owner'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/teams" className="text-sm text-slate-500 hover:text-slate-300">← Teams</Link>
        <div className="card mt-3">
          <div className="flex items-start justify-between">
            <div>
              {team.games && (
                <Link href={`/games/${team.games.slug}`} className="text-xs text-accent font-medium">{team.games.name}</Link>
              )}
              <h1 className="text-2xl font-bold text-slate-100 mt-1">{team.name}</h1>
              {team.description && <p className="text-slate-400 mt-2">{team.description}</p>}
            </div>
          </div>

          {isOwner && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              <span className="text-xs text-slate-500">Invite code:</span>
              <code className="bg-surface-3 text-slate-200 px-2 py-0.5 rounded text-sm font-mono">{team.invite_code}</code>
              <span className="text-xs text-slate-500">(share this privately)</span>
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      {team.announcements && (
        <div className="card border-accent/30">
          <h2 className="section-title flex items-center gap-2"><FileText size={16} className="text-accent" /> Announcements</h2>
          <p className="text-slate-300 whitespace-pre-wrap text-sm">{team.announcements}</p>
        </div>
      )}

      {/* Members */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2">
          <Users size={16} className="text-accent" /> Roster ({members?.length ?? 0})
        </h2>
        <div className="space-y-2">
          {members?.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                {m.role === 'owner' && <Crown size={14} className="text-yellow-400" />}
                <span className="text-slate-200 font-medium text-sm">{m.profiles?.username}</span>
                <span className="badge bg-surface-3 text-slate-400 text-xs">{m.role}</span>
              </div>
              {isOwner && m.user_id !== user?.id && (
                <TeamManagePanel memberId={m.id} teamId={params.id} username={m.profiles?.username} currentRole={m.role} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Owner settings */}
      {isOwner && (
        <div className="card">
          <h2 className="section-title">Team Settings</h2>
          <Link href={`/teams/${params.id}/edit`} className="btn-secondary text-sm">Edit team</Link>
        </div>
      )}
    </div>
  )
}

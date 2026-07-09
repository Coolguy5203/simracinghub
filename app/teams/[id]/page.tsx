import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, Crown, FileText, Cake } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { TeamManagePanel } from '@/components/TeamManagePanel'
import { RegenerateInviteButton } from '@/components/RegenerateInviteButton'
import { Avatar } from '@/components/Avatar'

interface Props { params: { id: string } }

export default async function TeamPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: team } = await supabase
    .from('srh_teams')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!team) notFound()

  const teamColor = team.color ?? '#e8322a'

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
        <Users size={48} className="mx-auto" style={{ color: teamColor }} />
        <h1 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
          {team.tag && (
            <span className="font-mono text-lg" style={{ color: teamColor }}>[{team.tag}]</span>
          )}
          {team.name}
        </h1>
        {team.description && <p className="text-slate-400">{team.description}</p>}
        <div className="card bg-surface-2 text-sm text-slate-400 py-6">
          <p>This is a private cross-sim team. You need an invite code to join.</p>
          {!user && (
            <p className="mt-2">
              <Link href="/login" className="text-accent hover:underline">Sign in</Link> first, then enter your invite code on the Teams page.
            </p>
          )}
        </div>
      </div>
    )
  }

  const [{ data: members }, { data: ranks }] = await Promise.all([
    supabase
      .from('srh_team_members')
      .select('id, role, joined_at, user_id, rank_id, profiles:srh_profiles(username), rank:srh_team_ranks(id, name, color, position)')
      .eq('team_id', params.id)
      .order('joined_at', { ascending: true }),
    supabase
      .from('srh_team_ranks')
      .select('id, name, color, position')
      .eq('team_id', params.id)
      .order('position', { ascending: true }),
  ])

  const isOwner = membership.role === 'owner'

  // Roster order: owners first, then by rank position (unranked last), then join date
  const sorted = [...(members ?? [])].sort((a: any, b: any) => {
    if ((a.role === 'owner') !== (b.role === 'owner')) return a.role === 'owner' ? -1 : 1
    const pa = a.rank?.position ?? Number.MAX_SAFE_INTEGER
    const pb = b.rank?.position ?? Number.MAX_SAFE_INTEGER
    if (pa !== pb) return pa - pb
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/teams" className="text-sm text-slate-500 hover:text-slate-300">← Teams</Link>
        <div className="card mt-3 overflow-hidden relative p-0">
          {/* Livery stripe */}
          <div
            className="h-2"
            style={{ background: `linear-gradient(90deg, ${teamColor}, ${teamColor}44, transparent)` }}
          />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                  {team.tag && (
                    <span className="font-mono text-xl" style={{ color: teamColor }}>[{team.tag}]</span>
                  )}
                  {team.name}
                </h1>
                {team.description && <p className="text-slate-400 mt-2">{team.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Cake size={12} /> Founded {format(new Date(team.created_at), 'MMMM yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="badge" style={{ backgroundColor: `${teamColor}1f`, color: teamColor }}>
                    Cross-sim
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <span className="text-xs text-slate-500">Invite code:</span>
                <code className="bg-surface-3 text-slate-200 px-2 py-0.5 rounded text-sm font-mono">{team.invite_code}</code>
                <RegenerateInviteButton teamId={team.id} />
                <span className="text-xs text-slate-500">(share this privately)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements */}
      {team.announcements && (
        <div className="card" style={{ borderColor: `${teamColor}4d` }}>
          <h2 className="section-title flex items-center gap-2">
            <FileText size={16} style={{ color: teamColor }} /> Announcements
          </h2>
          <p className="text-slate-300 whitespace-pre-wrap text-sm">{team.announcements}</p>
        </div>
      )}

      {/* Roster */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2">
          <Users size={16} style={{ color: teamColor }} /> Roster ({members?.length ?? 0})
        </h2>
        <div className="space-y-2">
          {sorted.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Link href={`/u/${m.profiles?.username}`} className="flex items-center gap-2 group/member min-w-0">
                  <Avatar username={m.profiles?.username ?? '??'} size="sm" />
                  {m.role === 'owner' && <Crown size={14} className="text-yellow-400 shrink-0" />}
                  <span className="text-slate-200 font-medium text-sm group-hover/member:text-accent transition-colors truncate">
                    {m.profiles?.username}
                  </span>
                </Link>
                {m.rank ? (
                  <span
                    className="badge font-medium"
                    style={{ backgroundColor: `${m.rank.color}26`, color: m.rank.color, border: `1px solid ${m.rank.color}55` }}
                  >
                    {m.rank.name}
                  </span>
                ) : (
                  <span className="badge bg-surface-3 text-slate-500 text-xs">{m.role}</span>
                )}
                <span className="text-xs text-slate-600 hidden sm:inline">
                  joined {formatDistanceToNow(new Date(m.joined_at), { addSuffix: true })}
                </span>
              </div>
              {isOwner && m.user_id !== user?.id && (
                <TeamManagePanel
                  memberId={m.id}
                  teamId={params.id}
                  username={m.profiles?.username}
                  currentRole={m.role}
                  currentRankId={m.rank_id}
                  ranks={ranks ?? []}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Owner settings */}
      {isOwner && (
        <div className="card">
          <h2 className="section-title">Team Settings</h2>
          <p className="text-sm text-slate-500 mb-3">Edit team details, livery color, and manage custom ranks.</p>
          <Link href={`/teams/${params.id}/edit`} className="btn-secondary text-sm">Edit team &amp; ranks</Link>
        </div>
      )}
    </div>
  )
}

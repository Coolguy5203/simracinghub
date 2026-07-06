import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TeamEditForm } from '@/components/TeamEditForm'

interface Props { params: { id: string } }

export const metadata = { title: 'Edit Team' }

export default async function EditTeamPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membership?.role !== 'owner') redirect(`/teams/${params.id}`)

  const { data: team } = await supabase.from('teams').select('*').eq('id', params.id).single()
  if (!team) notFound()

  const { data: games } = await supabase.from('games').select('id, name').order('name')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Edit Team</h1>
      <TeamEditForm team={team} games={games ?? []} />
    </div>
  )
}

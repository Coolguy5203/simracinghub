import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamForm } from '@/components/TeamForm'

export const metadata = { title: 'Create Team' }

export default async function NewTeamPage({
  searchParams,
}: {
  searchParams: { game?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: games } = await supabase.from('srh_games').select('id, name').order('name')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Create a Team</h1>
      <TeamForm games={games ?? []} defaultGameId={searchParams.game} userId={user.id} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/SettingsForm'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: games }] = await Promise.all([
    supabase
      .from('srh_profiles')
      .select('username, bio, wheel, pedals, cockpit, favorite_game_id')
      .eq('id', user.id)
      .single(),
    supabase.from('srh_games').select('id, name').order('name'),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      <SettingsForm
        userId={user.id}
        username={profile.username}
        initialBio={profile.bio ?? ''}
        initialWheel={profile.wheel ?? ''}
        initialPedals={profile.pedals ?? ''}
        initialCockpit={profile.cockpit ?? ''}
        initialFavoriteGameId={profile.favorite_game_id ?? ''}
        games={games ?? []}
      />
    </div>
  )
}

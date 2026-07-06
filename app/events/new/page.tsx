import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventForm } from '@/components/EventForm'

export const metadata = { title: 'Post Event' }

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { game?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: games } = await supabase.from('games').select('id, name').order('name')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Post an Event</h1>
      <EventForm games={games ?? []} defaultGameId={searchParams.game} userId={user.id} />
    </div>
  )
}

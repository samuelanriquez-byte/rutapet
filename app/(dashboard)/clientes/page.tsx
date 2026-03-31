import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientesPanel from '@/components/dashboard/ClientesPanel'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
  if (!negocio) redirect('/login')

  const trialEnds = negocio.trial_ends_at ? new Date(negocio.trial_ends_at) : null
  if (trialEnds && trialEnds < new Date() && negocio.plan === 'trial') redirect('/upgrade')

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 24 }}>👥 Clientes</h1>
      <ClientesPanel negocio={negocio} />
    </div>
  )
}

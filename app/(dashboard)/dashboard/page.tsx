import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordatoriosPanel from '@/components/dashboard/RecordatoriosPanel'
import PedidosPanel from '@/components/dashboard/PedidosPanel'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
  if (!negocio) redirect('/login')

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Buen día 👋</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{negocio.nombre}</p>
      </div>
      <RecordatoriosPanel negocio={negocio} />
      <div style={{ marginTop: 32 }}>
        <PedidosPanel negocio={negocio} />
      </div>
    </div>
  )
}

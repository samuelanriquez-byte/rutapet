import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfiguracionPanel from '@/components/dashboard/ConfiguracionPanel'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
  if (!negocio) redirect('/login')

  return (
    <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Configuración</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Ajustá los datos de tu negocio</p>
      </div>
      <ConfiguracionPanel negocio={negocio} />
    </div>
  )
}

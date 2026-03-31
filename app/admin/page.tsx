import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/admin/AdminPanel'

// Tu user_id — solo vos podés acceder
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) redirect('/dashboard')

  const admin = createAdminClient()

  // Traer todos los negocios con conteo de clientes y WhatsApps enviados
  const { data: negocios } = await admin
    .from('negocios')
    .select('*, clientes(count), pedidos(count)')
    .order('created_at', { ascending: false })

  // Métricas globales
  const total = negocios?.length || 0
  const enTrial = negocios?.filter((n: any) => n.plan === 'trial' && new Date(n.trial_ends_at) > new Date()).length || 0
  const pagando = negocios?.filter((n: any) => n.plan === 'monthly').length || 0
  const trialVencido = negocios?.filter((n: any) => n.plan === 'trial' && new Date(n.trial_ends_at) < new Date()).length || 0

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F5' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E4', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#EA6C00' }}>🐾 RutaPet Admin</span>
        <a href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Volver al dashboard</a>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total negocios', value: total, color: '#EA6C00', bg: '#FFF7ED' },
            { label: 'En trial activo', value: enTrial, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Pagando', value: pagando, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Trial vencido', value: trialVencido, color: '#DC2626', bg: '#FEF2F2' },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.color}22`, borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Tabla de negocios */}
        <AdminPanel negocios={negocios || []} />
      </div>
    </div>
  )
}

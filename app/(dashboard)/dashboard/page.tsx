import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordatoriosPanel from '@/components/dashboard/RecordatoriosPanel'
import PedidosPanel from '@/components/dashboard/PedidosPanel'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
  if (!negocio) redirect('/login')

  // Verificar trial
  const trialEnds = negocio.trial_ends_at ? new Date(negocio.trial_ends_at) : null
  const now = new Date()
  const trialExpired = trialEnds && trialEnds < now && negocio.plan === 'trial'
  if (trialExpired) redirect('/upgrade')

  const diasRestantes = trialEnds && negocio.plan === 'trial'
    ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  // Ver si es usuario nuevo (sin clientes)
  const { count } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('negocio_id', negocio.id)
  const esNuevo = count === 0

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Banner trial */}
      {diasRestantes !== null && diasRestantes <= 10 && (
        <div style={{
          background: diasRestantes <= 3 ? '#FFF0E8' : '#FFFBF0',
          border: `1px solid ${diasRestantes <= 3 ? '#FDDCB5' : '#FFE599'}`,
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
            {diasRestantes <= 3
              ? `⚠️ Tu período de prueba vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. ¡Activá tu suscripción para no perder nada!`
              : `⏳ Te quedan ${diasRestantes} días de prueba gratis.`
            }
          </p>
          <Link href="/upgrade" style={{ background: '#EA6C00', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap' }}>
            Activar →
          </Link>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Buen día 👋</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{negocio.nombre}</p>
      </div>

      {/* Bienvenida para usuarios nuevos */}
      {esNuevo ? (
        <div style={{ background: '#fff', border: '2px dashed #FDDCB5', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>¡Bienvenido a RutaPet!</h2>
          <p style={{ color: '#666', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 32px' }}>
            Para empezar, cargá tus clientes y sus mascotas. RutaPet va a detectar automáticamente cuándo necesitan alimento y vos elegís a quién avisar.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/clientes" style={{ background: '#EA6C00', color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '14px 28px', borderRadius: 10, fontSize: 15 }}>
              Cargar mi primer cliente →
            </Link>
            <Link href="/configuracion" style={{ border: '1px solid #E8E8E4', color: '#444', textDecoration: 'none', fontWeight: 600, padding: '14px 28px', borderRadius: 10, fontSize: 15 }}>
              Configurar mi negocio
            </Link>
          </div>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, textAlign: 'left' }}>
            {[
              { n: '1', icon: '👥', title: 'Cargá tus clientes', desc: 'Con su teléfono, mascota y ciclo de compra.' },
              { n: '2', icon: '🤖', title: 'RutaPet los detecta', desc: 'El sistema calcula quién necesita alimento.' },
              { n: '3', icon: '📲', title: 'Enviás el WhatsApp', desc: 'Un click y el cliente confirma su pedido.' },
            ].map(s => (
              <div key={s.n} style={{ background: '#FFF7ED', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#EA6C00', fontWeight: 700, marginBottom: 4 }}>PASO {s.n}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>{s.title}</p>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <RecordatoriosPanel negocio={negocio} />
          <div style={{ marginTop: 32 }}>
            <PedidosPanel negocio={negocio} />
          </div>
        </>
      )}
    </div>
  )
}

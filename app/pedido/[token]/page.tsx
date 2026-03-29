'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function PedidoPage() {
  const { token } = useParams()
  const [pedido, setPedido] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [mascotas, setMascotas] = useState<any[]>([])
  const [negocio, setNegocio] = useState<any>(null)
  const [kilos, setKilos] = useState<Record<string, number>>({})
  const [metodoPago, setMetodoPago] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState<'form' | 'ok' | 'vencido' | 'error'>('form')

  useEffect(() => {
    async function cargar() {
      const supabase = createClient()
      const { data: p } = await supabase.from('pedidos').select('*').eq('token', token).single()
      if (!p) { setEstado('error'); setLoading(false); return }

      if (p.estado === 'confirmado') { setPedido(p); setEstado('ok'); setLoading(false); return }

      const { data: c } = await supabase.from('clientes').select('*').eq('id', p.cliente_id).single()
      const { data: m } = await supabase.from('mascotas').select('*').eq('cliente_id', p.cliente_id)
      const { data: n } = await supabase.from('negocios').select('*').eq('id', p.negocio_id).single()

      const kilosIniciales: Record<string, number> = {}
      ;(m || []).forEach((mascota: any) => { kilosIniciales[mascota.id] = mascota.kilos })

      setPedido(p)
      setCliente(c)
      setMascotas(m || [])
      setNegocio(n)
      setKilos(kilosIniciales)
      if (n?.metodos_pago?.[0]) setMetodoPago(n.metodos_pago[0])
      setLoading(false)
    }
    cargar()
  }, [token])

  async function confirmar() {
    setEnviando(true)
    const res = await fetch('/api/pedidos/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, metodoPago, kilosOverride: kilos, notas }),
    })
    const data = await res.json()
    if (data.ok) setEstado('ok')
    else if (data.error?.includes('no se puede modificar')) setEstado('vencido')
    else setEstado('error')
    setEnviando(false)
  }

  const fechaFormateada = pedido ? new Date(pedido.fecha_entrega + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
      <p style={{ color: '#666' }}>Cargando tu pedido...</p>
    </div>
  )

  if (estado === 'ok') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8 }}>¡Pedido confirmado!</h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>
          Te llevamos el alimento el <strong>{fechaFormateada}</strong>. ¡Gracias por tu confianza! 🐾
        </p>
      </div>
    </div>
  )

  if (estado === 'vencido') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7F7', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Tiempo de modificación vencido</h1>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>Ya no podemos procesar cambios. Si necesitás algo, contactá directamente a la forrajería por WhatsApp.</p>
        {negocio?.whatsapp && (
          <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 20, background: '#EA6C00', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700 }}>
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </div>
  )

  if (estado === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7F7', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
        <p style={{ color: '#666' }}>No encontramos este pedido. El link puede haber expirado.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0', padding: 24 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{negocio?.nombre}</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
            Entrega el <strong>{fechaFormateada}</strong>
          </p>
        </div>

        {/* Resumen mascotas */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>🐶 Tu pedido</h2>
          {mascotas.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{m.nombre}</p>
                <p style={{ fontSize: 12, color: '#888' }}>{m.marca_alimento}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setKilos(p => ({ ...p, [m.id]: Math.max(1, (p[m.id] || m.kilos) - 1) }))}
                  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E8E8E4', background: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                <span style={{ fontSize: 15, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{kilos[m.id] || m.kilos} kg</span>
                <button onClick={() => setKilos(p => ({ ...p, [m.id]: (p[m.id] || m.kilos) + 1 }))}
                  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E8E8E4', background: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#AAA', marginTop: 8 }}>Podés modificar la cantidad hasta 8hs antes de la entrega.</p>
        </div>

        {/* Método de pago */}
        {negocio?.metodos_pago?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 14 }}>💳 Método de pago</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {negocio.metodos_pago.map((m: string) => (
                <button key={m} onClick={() => setMetodoPago(m)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${metodoPago === m ? '#EA6C00' : '#E8E8E4'}`, background: metodoPago === m ? '#FFF7ED' : '#fff', color: metodoPago === m ? '#EA6C00' : '#444', fontWeight: metodoPago === m ? 700 : 400, fontSize: 14, cursor: 'pointer' }}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>📝 Notas (opcional)</h2>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: dejar en portería, tocar timbre 2B..."
            rows={3} style={{ width: '100%', border: '1px solid #E8E8E4', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#333', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
        </div>

        <button onClick={confirmar} disabled={enviando || !metodoPago}
          style={{ width: '100%', background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: enviando ? 'default' : 'pointer' }}>
          {enviando ? 'Confirmando...' : '✅ Confirmar pedido'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 12 }}>
          Si necesitás hacer cambios especiales,{' '}
          {negocio?.whatsapp
            ? <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#EA6C00' }}>contactanos por WhatsApp</a>
            : 'contactá directamente a la forrajería'}.
        </p>
      </div>
    </div>
  )
}

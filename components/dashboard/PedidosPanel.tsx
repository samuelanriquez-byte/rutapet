'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ESTADO_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  pendiente: { bg: '#FEF9C3', color: '#854D0E', label: 'Pendiente' },
  confirmado: { bg: '#FEF3C7', color: '#92400E', label: 'Confirmado' },
  entregado: { bg: '#F3F4F6', color: '#374151', label: 'Entregado' },
  cancelado: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelado' },
}

export default function PedidosPanel({ negocio }: any) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [diasVista, setDiasVista] = useState(2)

  useEffect(() => { cargar() }, [negocio, diasVista])

  async function cargar() {
    const supabase = createClient()
    const hoy = new Date().toISOString().split('T')[0]
    const hasta = new Date()
    hasta.setDate(hasta.getDate() + diasVista)
    const fechaHasta = hasta.toISOString().split('T')[0]
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, telefono, localidad, direccion, observacion_domicilio), mascotas:clientes(mascotas(*))')
      .eq('negocio_id', negocio.id)
      .gte('fecha_entrega', hoy)
      .lte('fecha_entrega', fechaHasta)
      .order('fecha_entrega', { ascending: true })
    setPedidos(data || [])
    setLoading(false)
  }

  async function marcarEntregado(pedidoId: string) {
    const supabase = createClient()
    await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', pedidoId)
    await cargar()
  }

  async function togglePago(pedidoId: string, estadoActual: string) {
    const supabase = createClient()
    await supabase.from('pedidos').update({ estado_pago: estadoActual === 'abonado' ? 'pendiente' : 'abonado' }).eq('id', pedidoId)
    await cargar()
  }

  async function reenviarWhatsApp(pedidoId: string) {
    await fetch('/api/whatsapp/reenviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId }),
    })
  }

  async function eliminarPedido(pedidoId: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    const supabase = createClient()
    await supabase.from('pedidos').delete().eq('id', pedidoId)
    await cargar()
  }

  const confirmados = pedidos.filter(p => p.estado === 'confirmado').length

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E8E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            🚚 Próximos pedidos
            {confirmados > 0 && (
              <span style={{ marginLeft: 8, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {confirmados} confirmados
              </span>
            )}
          </h2>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Pedidos confirmados por los clientes</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 5].map(d => (
            <button key={d} onClick={() => setDiasVista(d)}
              style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: `1px solid ${diasVista === d ? '#EA6C00' : '#E8E8E4'}`, background: diasVista === d ? '#FFF7ED' : '#fff', color: diasVista === d ? '#EA6C00' : '#444', fontWeight: diasVista === d ? 700 : 400, cursor: 'pointer' }}>
              {d} días
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 600, color: '#444' }}>Sin pedidos para este día</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Los pedidos confirmados por los clientes aparecen acá.</p>
        </div>
      ) : (
        <div>
          {pedidos.map(p => {
            const cliente = p.clientes as any
            const mascotas = cliente?.mascotas || []
            const est = ESTADO_COLOR[p.estado] || ESTADO_COLOR.pendiente
            return (
              <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid #F3F3F0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#EA6C00', fontWeight: 700, marginBottom: 4 }}>
                    📅 {new Date(p.fecha_entrega + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{cliente?.nombre}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: est.bg, color: est.color }}>{est.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.estado_pago === 'abonado' ? '#F0FDF4' : '#FEF9C3', color: p.estado_pago === 'abonado' ? '#16A34A' : '#854D0E', cursor: 'pointer' }}
                      onClick={() => togglePago(p.id, p.estado_pago)}>
                      {p.estado_pago === 'abonado' ? '✅ Abonado' : '⏳ Sin pagar'}
                    </span>
                    {p.modificado && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: 99 }}>⚠️ Modificado</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                    📍 {cliente?.direccion || '—'}{cliente?.localidad ? `, ${cliente.localidad}` : ''}
                  </div>
                  {cliente?.observacion_domicilio && (
                    <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 2 }}>🏠 {cliente.observacion_domicilio}</div>
                  )}
                  <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>
                    {mascotas.map((m: any) => {
                      const kilos = p.kilos_override?.[m.id] ?? m.kilos
                      return `${m.nombre}: ${m.marca_alimento} ${kilos}kg`
                    }).join(' · ')}
                  </div>
                  {p.metodo_pago && (
                    <div style={{ fontSize: 12, color: '#EA6C00', marginTop: 4 }}>💳 {p.metodo_pago}</div>
                  )}
                  {p.notas && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>📝 {p.notas}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <a href={`https://wa.me/${cliente?.telefono?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: '#FFF7ED', color: '#EA6C00', textDecoration: 'none', border: '1px solid #FED7AA', fontWeight: 600 }}>
                    WhatsApp
                  </a>
                  {(p.estado === 'confirmado' || p.estado === 'entregado') && (
                    <button onClick={() => {
                      const supabase = createClient()
                      const nuevoEstado = p.estado === 'entregado' ? 'confirmado' : 'entregado'
                      supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', p.id).then(() => cargar())
                    }}
                      style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: p.estado === 'entregado' ? '#F3F4F6' : '#EA6C00', color: p.estado === 'entregado' ? '#374151' : '#fff', border: p.estado === 'entregado' ? '1px solid #E8E8E4' : 'none', cursor: 'pointer', fontWeight: 600 }}>
                      {p.estado === 'entregado' ? '↩ Pendiente' : '✓ Entregado'}
                    </button>
                  )}
                  {p.estado === 'pendiente' && (
                    <button onClick={() => {
                      const supabase = createClient()
                      supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', p.id).then(() => cargar())
                    }}
                      style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: '#EA6C00', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Entregado
                    </button>
                  )}
                  <button onClick={() => eliminarPedido(p.id)}
                    style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

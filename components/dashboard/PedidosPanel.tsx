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
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { cargar() }, [negocio, fecha])

  async function cargar() {
    const supabase = createClient()
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, telefono, localidad, direccion, observacion_domicilio), mascotas:clientes(mascotas(*))')
      .eq('negocio_id', negocio.id)
      .eq('fecha_entrega', fecha)
      .order('created_at', { ascending: true })
    setPedidos(data || [])
    setLoading(false)
  }

  async function marcarEntregado(pedidoId: string) {
    const supabase = createClient()
    await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', pedidoId)
    await cargar()
  }

  const confirmados = pedidos.filter(p => p.estado === 'confirmado').length

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E8E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            🚚 Pedidos del día
            {confirmados > 0 && (
              <span style={{ marginLeft: 8, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {confirmados} confirmados
              </span>
            )}
          </h2>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Pedidos a entregar y su estado</p>
        </div>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1px solid #E8E8E4', color: '#444', outline: 'none' }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{cliente?.nombre}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: est.bg, color: est.color }}>{est.label}</span>
                    {p.modificado && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: 99 }}>⚠️ Modificado</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                    📍 {cliente?.direccion || '—'}{cliente?.localidad ? `, ${cliente.localidad}` : ''}
                  </div>
                  {cliente?.observacion_domicilio && (
                    <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 2 }}>⚠️ {cliente.observacion_domicilio}</div>
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
                  {p.estado === 'confirmado' && (
                    <button onClick={() => marcarEntregado(p.id)}
                      style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: '#EA6C00', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Entregado
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

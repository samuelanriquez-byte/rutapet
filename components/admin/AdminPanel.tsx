'use client'
import { useState } from 'react'

export default function AdminPanel({ negocios }: { negocios: any[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [negocioDetalle, setNegocioDetalle] = useState<any>(null)
  const [extendiendo, setExtendiendo] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'gestionar' | 'clientes' | 'config' | 'pedidos'>('gestionar')
  const [detalleData, setDetalleData] = useState<any>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  async function abrirDetalle(n: any) {
    setNegocioDetalle(n)
    setTab('gestionar')
    setDetalleData(null)
  }

  async function cargarTab(tabNuevo: 'clientes' | 'config' | 'pedidos') {
    setTab(tabNuevo)
    if (detalleData) return // ya cargado
    setCargandoDetalle(true)
    const res = await fetch(`/api/admin/negocio-detalle?id=${negocioDetalle.id}`)
    const data = await res.json()
    setDetalleData(data)
    setCargandoDetalle(false)
  }

  const ahora = new Date()

  const filtrados = negocios.filter(n => {
    const coincide = n.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.email?.toLowerCase().includes(busqueda.toLowerCase())
    if (filtro === 'trial') return coincide && n.plan === 'trial' && new Date(n.trial_ends_at) > ahora
    if (filtro === 'pagando') return coincide && n.plan === 'monthly'
    if (filtro === 'vencido') return coincide && n.plan === 'trial' && new Date(n.trial_ends_at) < ahora
    return coincide
  })

  function diasTrial(n: any) {
    if (!n.trial_ends_at) return null
    const diff = Math.ceil((new Date(n.trial_ends_at).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  async function extenderTrial(negocioId: string, dias: number) {
    setExtendiendo(true)
    setMsg('')
    const res = await fetch('/api/admin/extender-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negocioId, dias }),
    })
    const data = await res.json()
    if (data.ok) {
      setMsg(`✅ Trial extendido ${dias} días`)
      setNegocioDetalle(null)
    } else {
      setMsg('❌ Error al extender')
    }
    setExtendiendo(false)
  }

  async function cambiarPlan(negocioId: string, plan: string) {
    const res = await fetch('/api/admin/cambiar-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negocioId, plan }),
    })
    const data = await res.json()
    if (data.ok) setMsg(`✅ Plan cambiado a ${plan}`)
    else setMsg('❌ Error al cambiar plan')
    setNegocioDetalle(null)
  }

  async function eliminarNegocio(negocioId: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}" y todos sus datos? Esta acción no se puede deshacer.`)) return
    const res = await fetch('/api/admin/eliminar-negocio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negocioId }),
    })
    const data = await res.json()
    if (data.ok) {
      setMsg(`✅ Negocio eliminado`)
      setNegocioDetalle(null)
      window.location.reload()
    } else {
      setMsg('❌ Error al eliminar')
    }
  }

  return (
    <div>
      {msg && (
        <div style={{ background: msg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${msg.startsWith('✅') ? '#BBF7D0' : '#FCA5A5'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: msg.startsWith('✅') ? '#166534' : '#DC2626' }}>
          {msg}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar negocio o email..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #E8E8E4', fontSize: 14, outline: 'none' }} />
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'trial', label: '⏳ Trial activo' },
          { key: 'pagando', label: '✅ Pagando' },
          { key: 'vencido', label: '❌ Vencido' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            style={{ padding: '9px 16px', borderRadius: 9, border: `1px solid ${filtro === f.key ? '#EA6C00' : '#E8E8E4'}`, background: filtro === f.key ? '#FFF7ED' : '#fff', color: filtro === f.key ? '#EA6C00' : '#444', fontWeight: filtro === f.key ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '12px 20px', borderBottom: '1px solid #E8E8E4', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Negocio</span>
          <span>Plan</span>
          <span>Trial / Vence</span>
          <span>Clientes</span>
          <span>Pedidos</span>
          <span></span>
        </div>

        {filtrados.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>Sin resultados</div>
        ) : filtrados.map(n => {
          const dias = diasTrial(n)
          const vencido = n.plan === 'trial' && dias !== null && dias < 0
          const cantClientes = n.clientes?.[0]?.count || 0
          const cantPedidos = n.pedidos?.[0]?.count || 0

          return (
            <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '14px 20px', borderBottom: '1px solid #F3F3F0', alignItems: 'center', background: vencido ? '#FFF8F8' : '#fff' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{n.nombre}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{n.email}</div>
                {n.whatsapp && <div style={{ fontSize: 12, color: '#25D366', marginTop: 1 }}>💬 {n.whatsapp}</div>}
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: n.plan === 'monthly' ? '#F0FDF4' : '#FFF7ED', color: n.plan === 'monthly' ? '#16A34A' : '#EA6C00' }}>
                  {n.plan === 'monthly' ? '✅ Pagando' : '⏳ Trial'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: vencido ? '#DC2626' : '#444', fontWeight: vencido ? 700 : 400 }}>
                {dias === null ? '—' : vencido ? `Vencido hace ${Math.abs(dias)}d` : `${dias}d restantes`}
              </div>
              <div style={{ fontSize: 14, color: '#444' }}>{cantClientes}</div>
              <div style={{ fontSize: 14, color: '#444' }}>{cantPedidos}</div>
              <button onClick={() => abrirDetalle(n)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', cursor: 'pointer', color: '#444' }}>
                Gestionar
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal gestionar */}
      {negocioDetalle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '24px 28px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{negocioDetalle.nombre}</h2>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{negocioDetalle.email}</p>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E8E8E4' }}>
                {([
                  { key: 'gestionar', label: '⚙️ Gestionar' },
                  { key: 'clientes', label: '👥 Clientes' },
                  { key: 'pedidos', label: '📦 Pedidos' },
                  { key: 'config', label: '🔧 Config' },
                ] as const).map(t => (
                  <button key={t.key}
                    onClick={() => t.key === 'gestionar' ? setTab('gestionar') : cargarTab(t.key)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? '#EA6C00' : '#666', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #EA6C00' : '2px solid transparent', cursor: 'pointer', marginBottom: -1 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>

              {/* Tab: Gestionar */}
              {tab === 'gestionar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#F7F7F5', borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 10 }}>EXTENDER TRIAL</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[7, 15, 30, 45].map(d => (
                        <button key={d} onClick={() => extenderTrial(negocioDetalle.id, d)} disabled={extendiendo}
                          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                          +{d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#F7F7F5', borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 10 }}>CAMBIAR PLAN</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => cambiarPlan(negocioDetalle.id, 'trial')}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#FFF7ED', fontSize: 13, cursor: 'pointer', color: '#EA6C00', fontWeight: 600 }}>
                        ⏳ Trial
                      </button>
                      <button onClick={() => cambiarPlan(negocioDetalle.id, 'monthly')}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #BBF7D0', background: '#F0FDF4', fontSize: 13, cursor: 'pointer', color: '#16A34A', fontWeight: 600 }}>
                        ✅ Pagando
                      </button>
                      <button onClick={() => cambiarPlan(negocioDetalle.id, 'gratis')}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#666', fontWeight: 600 }}>
                        🎁 Gratis
                      </button>
                    </div>
                  </div>

                  <button onClick={() => eliminarNegocio(negocioDetalle.id, negocioDetalle.nombre)}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    🗑 Eliminar negocio y todos sus datos
                  </button>
                </div>
              )}

              {/* Tab: Clientes */}
              {tab === 'clientes' && (
                <div>
                  {!cargandoDetalle && (
                    <a href={`/api/admin/descargar-clientes?id=${negocioDetalle.id}&nombre=${encodeURIComponent(negocioDetalle.nombre)}`}
                      style={{ display: 'inline-block', marginBottom: 16, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', color: '#444', textDecoration: 'none', fontWeight: 600 }}>
                      ⬇️ Descargar CSV
                    </a>
                  )}
                  {cargandoDetalle ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Cargando...</p>
                  ) : detalleData?.clientes?.length === 0 ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Sin clientes cargados.</p>
                  ) : detalleData?.clientes?.map((c: any) => (
                    <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F3F0' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.telefono} · {c.direccion}</div>
                      {c.mascotas?.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {c.mascotas.map((m: any) => (
                            <span key={m.id} style={{ fontSize: 11, background: '#FFF7ED', color: '#EA6C00', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                              🐾 {m.nombre} · {m.marca} · {m.kilos}kg / {m.ciclo_dias}d
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Pedidos */}
              {tab === 'pedidos' && (
                <div>
                  {cargandoDetalle ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Cargando...</p>
                  ) : detalleData?.pedidos?.length === 0 ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Sin pedidos registrados.</p>
                  ) : detalleData?.pedidos?.map((p: any) => (
                    <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F3F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.cliente_nombre || 'Cliente'}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString('es-AR')} · {p.metodo_pago || '—'}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: p.estado === 'confirmado' ? '#F0FDF4' : '#FFF7ED', color: p.estado === 'confirmado' ? '#16A34A' : '#EA6C00' }}>
                        {p.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Config */}
              {tab === 'config' && (
                <div>
                  {cargandoDetalle ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Cargando...</p>
                  ) : detalleData?.negocio ? (() => {
                    const n = detalleData.negocio
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                          { label: 'Nombre', value: n.nombre },
                          { label: 'Teléfono', value: n.telefono },
                          { label: 'WhatsApp', value: n.whatsapp },
                          { label: 'Dirección', value: n.direccion },
                          { label: 'Días anticipación', value: n.dias_anticipacion },
                          { label: 'Métodos de pago', value: n.metodos_pago?.join(', ') },
                          { label: 'Plan', value: n.plan },
                          { label: 'Trial vence', value: n.trial_ends_at ? new Date(n.trial_ends_at).toLocaleDateString('es-AR') : '—' },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F3F0' }}>
                            <span style={{ fontSize: 13, color: '#888' }}>{row.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{row.value || '—'}</span>
                          </div>
                        ))}
                        {n.mensaje_whatsapp && (
                          <div style={{ background: '#F7F7F5', borderRadius: 10, padding: 12 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 6 }}>MENSAJE WHATSAPP</p>
                            <p style={{ fontSize: 13, color: '#333', whiteSpace: 'pre-wrap', margin: 0 }}>{n.mensaje_whatsapp}</p>
                          </div>
                        )}
                      </div>
                    )
                  })() : null}
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #E8E8E4' }}>
              <button onClick={() => { setNegocioDetalle(null); setDetalleData(null) }}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E8E8E4', background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

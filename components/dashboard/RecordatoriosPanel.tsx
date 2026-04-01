'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ClienteAlerta = {
  id: string
  nombre: string
  telefono: string
  localidad: string | null
  diasDesdeUltimo: number
  ciclo_dias: number
  mascotas: { nombre: string; marca_alimento: string; kilos: number }[]
  seleccionado: boolean
  diasDesdeWhatsapp: number | null
}

export default function RecordatoriosPanel({ negocio }: any) {
  const [clientes, setClientes] = useState<ClienteAlerta[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState('')
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas')
  const [localidades, setLocalidades] = useState<string[]>([])

  useEffect(() => { cargar() }, [negocio])

  async function cargar() {
    const supabase = createClient()
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data: clientesDB } = await supabase
      .from('clientes')
      .select('*, mascotas(*)')
      .eq('negocio_id', negocio.id)
      .eq('activo', true)
      .not('telefono', 'is', null)

    if (!clientesDB) { setLoading(false); return }

    const alertas: ClienteAlerta[] = []
    for (const c of clientesDB) {
      if (!c.ultimo_pedido_fecha) continue
      const ultimaFecha = new Date(c.ultimo_pedido_fecha + 'T00:00:00')
      const dias = Math.floor((hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24))
      const ciclo = c.ciclo_dias || 30
      // Mostrar si está entre (ciclo - 3) y (ciclo + 2) días
      let diasDesdeWhatsapp: number | null = null
      if (c.ultimo_whatsapp_fecha) {
        const fechaWsp = new Date(c.ultimo_whatsapp_fecha)
        diasDesdeWhatsapp = Math.floor((hoy.getTime() - fechaWsp.getTime()) / (1000 * 60 * 60 * 24))
      }

      if (dias >= ciclo - 3) {
        alertas.push({
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          localidad: c.localidad,
          diasDesdeUltimo: dias,
          ciclo_dias: ciclo,
          mascotas: c.mascotas || [],
          seleccionado: diasDesdeWhatsapp === null || diasDesdeWhatsapp >= 7,
          diasDesdeWhatsapp,
        })
      }
    }

    const locs = [...new Set(alertas.map(a => a.localidad).filter(Boolean))] as string[]
    setLocalidades(locs)
    setClientes(alertas)
    setLoading(false)
  }

  function toggleSeleccion(id: string) {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, seleccionado: !c.seleccionado } : c))
  }

  function seleccionarPorLocalidad(loc: string) {
    setClientes(prev => prev.map(c => ({ ...c, seleccionado: c.localidad === loc })))
    setFiltroLocalidad(loc)
  }

  function seleccionarTodos() {
    setClientes(prev => prev.map(c => ({ ...c, seleccionado: c.diasDesdeWhatsapp === null || c.diasDesdeWhatsapp >= 7 })))
    setFiltroLocalidad('todas')
  }

  async function enviarWhatsApps() {
    const seleccionados = clientes.filter(c => c.seleccionado)
    if (seleccionados.length === 0) return
    setEnviando(true)
    setResultado('')
    try {
      const res = await fetch('/api/whatsapp/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, clienteIds: seleccionados.map(c => c.id) }),
      })
      const data = await res.json()
      if (data.ok) {
        setResultado(`✅ ${data.enviados} WhatsApp${data.enviados !== 1 ? 's' : ''} enviado${data.enviados !== 1 ? 's' : ''} correctamente.`)
        await cargar()
      } else {
        setResultado('❌ Error al enviar. Verificá la configuración de Twilio.')
      }
    } catch {
      setResultado('❌ Error de conexión.')
    }
    setEnviando(false)
  }

  const visibles = filtroLocalidad === 'todas' ? clientes : clientes.filter(c => c.localidad === filtroLocalidad)
  const seleccionados = clientes.filter(c => c.seleccionado).length

  if (loading) return <div style={{ color: '#666', fontSize: 14 }}>Calculando recordatorios...</div>

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E8E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            🔔 Clientes que se quedan sin alimento
            {clientes.length > 0 && (
              <span style={{ marginLeft: 8, background: '#FEF08A', color: '#854D0E', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {clientes.length}
              </span>
            )}
          </h2>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Seleccioná a quién mandar el recordatorio por WhatsApp</p>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={seleccionarTodos}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', cursor: 'pointer', color: '#444' }}>
            Seleccionar todos
          </button>
          {localidades.map(loc => (
            <button key={loc} onClick={() => seleccionarPorLocalidad(loc)}
              style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8E8E4', background: filtroLocalidad === loc ? '#FFF7ED' : '#fff', cursor: 'pointer', color: filtroLocalidad === loc ? '#EA6C00' : '#444', fontWeight: filtroLocalidad === loc ? 700 : 400 }}>
              📍 {loc}
            </button>
          ))}
          <button
            onClick={enviarWhatsApps}
            disabled={enviando || seleccionados === 0}
            style={{ fontSize: 13, padding: '7px 18px', borderRadius: 8, border: 'none', background: seleccionados === 0 ? '#E8E8E4' : '#EA6C00', color: seleccionados === 0 ? '#999' : '#fff', cursor: seleccionados === 0 ? 'default' : 'pointer', fontWeight: 700 }}>
            {enviando ? 'Enviando...' : `📲 Enviar a ${seleccionados} seleccionados`}
          </button>
        </div>
      </div>

      {resultado && (
        <div style={{ padding: '12px 24px', background: resultado.startsWith('✅') ? '#FFF7ED' : '#FEF2F2', borderBottom: '1px solid #E8E8E4', fontSize: 13, color: resultado.startsWith('✅') ? '#EA6C00' : '#DC2626' }}>
          {resultado}
        </div>
      )}

      {/* Lista */}
      {clientes.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <p style={{ fontWeight: 600, color: '#444' }}>Todo al día</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Ningún cliente se queda sin alimento en los próximos días.</p>
          <p style={{ fontSize: 12, color: '#BBB', marginTop: 12 }}>
            💡 Un cliente aparece acá cuando confirmó al menos un pedido. Si no aparece, verificá que tenga un pedido registrado.
          </p>
        </div>
      ) : (
        <div>
          {visibles.map(c => {
            const diasRestantes = c.ciclo_dias - c.diasDesdeUltimo
            const bloqueado = c.diasDesdeWhatsapp !== null && c.diasDesdeWhatsapp < 7
            const advertencia = c.diasDesdeWhatsapp !== null && c.diasDesdeWhatsapp >= 5 && c.diasDesdeWhatsapp < 7
            return (
              <div key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: '1px solid #F3F3F0', background: bloqueado ? '#F9F9F9' : c.seleccionado ? '#FFF7ED' : '#fff', cursor: bloqueado ? 'default' : 'pointer', opacity: bloqueado ? 0.6 : 1 }}
                onClick={() => !bloqueado && toggleSeleccion(c.id)}>
                {/* Checkbox */}
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${bloqueado ? '#DDD' : c.seleccionado ? '#EA6C00' : '#CCC'}`, background: bloqueado ? '#EEE' : c.seleccionado ? '#EA6C00' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.seleccionado && !bloqueado && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: bloqueado ? '#999' : '#111' }}>{c.nombre}</span>
                    {c.localidad && <span style={{ fontSize: 11, color: '#888', background: '#F3F3F0', padding: '2px 7px', borderRadius: 99 }}>📍 {c.localidad}</span>}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: diasRestantes <= 0 ? '#FEE2E2' : '#FEF9C3', color: diasRestantes <= 0 ? '#DC2626' : '#854D0E' }}>
                      {diasRestantes <= 0 ? `Venció hace ${Math.abs(diasRestantes)} días` : `Vence en ${diasRestantes} días`}
                    </span>
                    {bloqueado && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: advertencia ? '#FEF9C3' : '#FEE2E2', color: advertencia ? '#854D0E' : '#DC2626' }}>
                        🚫 Mensaje enviado hace {c.diasDesdeWhatsapp} día{c.diasDesdeWhatsapp !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                    {c.mascotas.map(m => `${m.nombre} — ${m.marca_alimento} ${m.kilos}kg`).join(' · ')}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {c.telefono}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

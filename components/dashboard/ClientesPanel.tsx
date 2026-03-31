'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CICLOS = [7, 15, 20, 30, 45, 60]

export default function ClientesPanel({ negocio }: any) {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalCliente, setModalCliente] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [mascotas, setMascotas] = useState<any[]>([])
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => { cargar() }, [negocio])

  async function cargar() {
    const supabase = createClient()
    const { data } = await supabase.from('clientes').select('*, mascotas(*)').eq('negocio_id', negocio.id).order('nombre')
    setClientes(data || [])
    setLoading(false)
  }

  function abrirNuevo() {
    setForm({ nombre: '', telefono: '', email: '', direccion: '', localidad: '', codigo_postal: '', partido: '', observacion_domicilio: '', observacion_cliente: '', ciclo_dias: 30 })
    setMascotas([{ nombre: '', marca_alimento: '', kilos: 15 }])
    setModalCliente(null)
    setMostrarForm(true)
  }

  function abrirEditar(c: any) {
    setForm({ ...c })
    setMascotas(c.mascotas?.length ? c.mascotas : [{ nombre: '', marca_alimento: '', kilos: 15 }])
    setModalCliente(c)
    setMostrarForm(true)
  }

  function agregarMascota() {
    setMascotas(p => [...p, { nombre: '', marca_alimento: '', kilos: 15 }])
  }

  function updateMascota(i: number, field: string, value: any) {
    setMascotas(p => p.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  async function guardar() {
    if (!form.nombre || !form.telefono) return
    setGuardando(true)
    const supabase = createClient()

    if (modalCliente) {
      await supabase.from('clientes').update({ ...form }).eq('id', modalCliente.id)
      await supabase.from('mascotas').delete().eq('cliente_id', modalCliente.id)
      for (const m of mascotas.filter(m => m.nombre)) {
        await supabase.from('mascotas').insert({ cliente_id: modalCliente.id, ...m })
      }
    } else {
      const { data: nuevo } = await supabase.from('clientes').insert({ negocio_id: negocio.id, ...form }).select().single()
      if (nuevo) {
        for (const m of mascotas.filter(m => m.nombre)) {
          await supabase.from('mascotas').insert({ cliente_id: nuevo.id, ...m })
        }
      }
    }

    setMostrarForm(false)
    setGuardando(false)
    await cargar()
  }

  async function toggleActivo(c: any) {
    const supabase = createClient()
    await supabase.from('clientes').update({ activo: !c.activo }).eq('id', c.id)
    await cargar()
  }

  async function eliminarCliente(c: any) {
    if (!confirm(`¿Eliminar a ${c.nombre}? Se borrarán sus mascotas y pedidos.`)) return
    const supabase = createClient()
    await supabase.from('clientes').delete().eq('id', c.id)
    await cargar()
  }

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono || '').includes(search) ||
    (c.localidad || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color: '#666', fontSize: 14 }}>Cargando...</div>

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, teléfono o localidad..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9, border: '1px solid #E8E8E4', fontSize: 14, outline: 'none' }} />
        <button onClick={abrirNuevo}
          style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + Nuevo cliente
        </button>
      </div>

      {/* Lista */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <p style={{ fontWeight: 600, color: '#444' }}>Sin clientes aún</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Agregá tu primer cliente con el botón de arriba.</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #F3F3F0', opacity: c.activo ? 1 : 0.5 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#EA6C00', flexShrink: 0 }}>
              {c.nombre[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</span>
                {c.localidad && <span style={{ fontSize: 11, color: '#888', background: '#F3F3F0', padding: '2px 7px', borderRadius: 99 }}>📍 {c.localidad}</span>}
                <span style={{ fontSize: 11, color: '#EA6C00', background: '#FEF3C7', padding: '2px 7px', borderRadius: 99 }}>🔄 cada {c.ciclo_dias} días</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {c.telefono} · {(c.mascotas || []).map((m: any) => `${m.nombre} (${m.marca_alimento})`).join(', ')}
              </div>
              {c.ultimo_pedido_fecha && (
                <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>
                  Último pedido: {new Date(c.ultimo_pedido_fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => abrirEditar(c)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid #E8E8E4', background: '#fff', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => toggleActivo(c)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid #E8E8E4', background: '#fff', cursor: 'pointer', color: c.activo ? '#DC2626' : '#EA6C00' }}>
                {c.activo ? 'Pausar' : 'Activar'}
              </button>
              <button onClick={() => eliminarCliente(c)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#DC2626' }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Form */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{modalCliente ? 'Editar cliente' : 'Nuevo cliente'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { field: 'nombre', label: 'Nombre *', placeholder: 'Juan García' },
                { field: 'telefono', label: 'Teléfono *', placeholder: 'Ej: 011 15-1234-5678 o 2664944337' },
                { field: 'email', label: 'Email', placeholder: 'juan@email.com' },
                { field: 'direccion', label: 'Dirección', placeholder: 'Av. Corrientes 1234' },
                { field: 'localidad', label: 'Localidad', placeholder: 'Palermo' },
                { field: 'codigo_postal', label: 'Código postal', placeholder: '1425' },
                { field: 'partido', label: 'Partido', placeholder: 'CABA' },
              ].map(({ field, label, placeholder }) => (
                <div key={field} style={{ gridColumn: field === 'nombre' || field === 'telefono' ? 'auto' : 'auto' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={form[field] || ''} onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))} placeholder={placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none' }} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534' }}>
                📱 Podés poner el número como quieras — el sistema lo ajusta automáticamente para WhatsApp.
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Observación domicilio</label>
                <input value={form.observacion_domicilio || ''} onChange={e => setForm((p: any) => ({ ...p, observacion_domicilio: e.target.value }))} placeholder="Ej: timbre 3B, dejar en portería..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Observación del cliente</label>
                <input value={form.observacion_cliente || ''} onChange={e => setForm((p: any) => ({ ...p, observacion_cliente: e.target.value }))} placeholder="Ej: prefiere que no lo llamen"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Ciclo de compra</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CICLOS.map(d => (
                    <button key={d} onClick={() => setForm((p: any) => ({ ...p, ciclo_dias: d }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `2px solid ${form.ciclo_dias === d ? '#EA6C00' : '#E8E8E4'}`, background: form.ciclo_dias === d ? '#FFF7ED' : '#fff', color: form.ciclo_dias === d ? '#EA6C00' : '#444', fontWeight: form.ciclo_dias === d ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
                      {d} días
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mascotas */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>🐶 Mascotas</h3>
                <button onClick={agregarMascota} style={{ fontSize: 12, color: '#EA6C00', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Agregar mascota</button>
              </div>
              {mascotas.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8, marginBottom: 10, padding: 12, background: '#FFF8F0', borderRadius: 10 }}>
                  <input value={m.nombre} onChange={e => updateMascota(i, 'nombre', e.target.value)} placeholder="Nombre (ej: Firulais)"
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none' }} />
                  <div>
                    <input value={m.marca_alimento} onChange={e => updateMascota(i, 'marca_alimento', e.target.value)} placeholder="Marca (ej: Pedigree)" list="marcas-list"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    <datalist id="marcas-list">
                      {(negocio?.marcas_alimento || []).map((marca: string) => <option key={marca} value={marca} />)}
                    </datalist>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="number" value={m.kilos} onChange={e => updateMascota(i, 'kilos', Number(e.target.value))} min={1}
                      style={{ width: '100%', padding: '8px 6px', borderRadius: 7, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                    <span style={{ fontSize: 11, color: '#888' }}>kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E8E8E4', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#666' }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando || !form.nombre || !form.telefono}
                style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#EA6C00', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {guardando ? 'Guardando...' : modalCliente ? 'Guardar cambios' : 'Agregar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

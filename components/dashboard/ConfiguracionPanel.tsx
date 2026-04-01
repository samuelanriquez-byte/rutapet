'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const METODOS_PAGO_OPCIONES = ['efectivo', 'transferencia', 'débito', 'crédito', 'mercado pago']

const MENSAJE_DEFAULT = `¡Hola {nombre}! 👋

Te recordamos que a tu mascota le está por terminar el alimento:

{mascotas}

*{negocio}* estará repartiendo el *{fecha}* por tu zona.

Confirmá tu pedido acá 👇
{link}

_Podés modificar cantidad, peso o dirección hasta 8hs antes de la entrega._`

export default function ConfiguracionPanel({ negocio }: any) {
  const [form, setForm] = useState({
    nombre: negocio.nombre || '',
    telefono: negocio.telefono || '',
    whatsapp: negocio.whatsapp || '',
    direccion: negocio.direccion || '',
    dias_anticipacion: negocio.dias_anticipacion || 1,
    metodos_pago: negocio.metodos_pago || ['efectivo'],
    marcas_alimento: negocio.marcas_alimento || [],
    mensaje_whatsapp: negocio.mensaje_whatsapp || MENSAJE_DEFAULT,
    promocion_whatsapp: negocio.promocion_whatsapp || '',
    alias_mercadopago: negocio.alias_mercadopago || '',
    telefono_comprobantes: negocio.telefono_comprobantes || '',
  })
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const [nuevaMarca, setNuevaMarca] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  function toggleMetodoPago(m: string) {
    setForm(p => ({
      ...p,
      metodos_pago: p.metodos_pago.includes(m)
        ? p.metodos_pago.filter((x: string) => x !== m)
        : [...p.metodos_pago, m]
    }))
  }

  function agregarMarca() {
    const marca = nuevaMarca.trim()
    if (!marca || form.marcas_alimento.includes(marca)) return
    setForm(p => ({ ...p, marcas_alimento: [...p.marcas_alimento, marca] }))
    setNuevaMarca('')
  }

  function quitarMarca(marca: string) {
    setForm(p => ({ ...p, marcas_alimento: p.marcas_alimento.filter((m: string) => m !== marca) }))
  }

  async function guardar() {
    setGuardando(true)
    const supabase = createClient()
    await supabase.from('negocios').update(form).eq('id', negocio.id)
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Datos del negocio */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏪 Datos del negocio</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { field: 'nombre', label: 'Nombre del negocio', placeholder: 'Forrajería El Perro Feliz' },
            { field: 'telefono', label: 'Teléfono', placeholder: '11 1234-5678' },
            { field: 'whatsapp', label: 'WhatsApp (con código de país)', placeholder: '5491112345678' },
            { field: 'direccion', label: 'Dirección', placeholder: 'Av. Corrientes 1234' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
              <input value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Marcas de alimento */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🥩 Marcas de alimento que trabajás</h2>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Aparecen como sugerencias al cargar mascotas de tus clientes.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={nuevaMarca} onChange={e => setNuevaMarca(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarMarca()} placeholder="Ej: Pedigree, Royal Canin, Balanceados X..."
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none' }} />
          <button onClick={agregarMarca}
            style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {form.marcas_alimento.length === 0 && (
            <p style={{ fontSize: 13, color: '#AAA' }}>Todavía no agregaste marcas.</p>
          )}
          {form.marcas_alimento.map((m: string) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF7ED', border: '1px solid #FDDCB5', borderRadius: 99, padding: '4px 12px', fontSize: 13, color: '#EA6C00' }}>
              {m}
              <button onClick={() => quitarMarca(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EA6C00', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Métodos de pago */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>💳 Métodos de pago</h2>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Los clientes van a poder elegir entre estos al confirmar su pedido.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {METODOS_PAGO_OPCIONES.map(m => (
            <button key={m} onClick={() => toggleMetodoPago(m)}
              style={{ padding: '7px 16px', borderRadius: 8, border: `2px solid ${form.metodos_pago.includes(m) ? '#EA6C00' : '#E8E8E4'}`, background: form.metodos_pago.includes(m) ? '#FFF7ED' : '#fff', color: form.metodos_pago.includes(m) ? '#EA6C00' : '#444', fontWeight: form.metodos_pago.includes(m) ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {form.metodos_pago.includes('mercado pago') && (
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0369A1', margin: 0 }}>💳 Datos de Mercado Pago — los verá el cliente al confirmar el pedido</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Alias de MP</label>
                <input value={form.alias_mercadopago} onChange={e => setForm(p => ({ ...p, alias_mercadopago: e.target.value }))}
                  placeholder="Ej: miforrajeria.mp"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #BAE6FD', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Teléfono para comprobantes</label>
                <input value={form.telefono_comprobantes} onChange={e => setForm(p => ({ ...p, telefono_comprobantes: e.target.value }))}
                  placeholder="Ej: 11 1234-5678"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #BAE6FD', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Días anticipación */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📅 Días de anticipación</h2>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Cuántos días antes de que se termine el alimento querés avisar al cliente.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 5].map(d => (
            <button key={d} onClick={() => setForm(p => ({ ...p, dias_anticipacion: d }))}
              style={{ padding: '7px 16px', borderRadius: 8, border: `2px solid ${form.dias_anticipacion === d ? '#EA6C00' : '#E8E8E4'}`, background: form.dias_anticipacion === d ? '#FFF7ED' : '#fff', color: form.dias_anticipacion === d ? '#EA6C00' : '#444', fontWeight: form.dias_anticipacion === d ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
              {d} día{d > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje WhatsApp */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8E4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>💬 Mensaje de WhatsApp</h2>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
          Personalizá el mensaje que reciben tus clientes. Podés usar estas variables:
          <span style={{ color: '#EA6C00', fontWeight: 600 }}> {'{nombre}'} {'{mascotas}'} {'{fecha}'} {'{link}'} {'{negocio}'}</span>
        </p>

        <textarea
          value={form.mensaje_whatsapp}
          onChange={e => setForm(p => ({ ...p, mensaje_whatsapp: e.target.value }))}
          rows={10}
          style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
        />

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
            🎁 Promoción (opcional) — se agrega al final del mensaje
          </label>
          <input
            value={form.promocion_whatsapp}
            onChange={e => setForm(p => ({ ...p, promocion_whatsapp: e.target.value }))}
            placeholder="Ej: Si confirmás hoy te hacemos un 5% de descuento 🎉"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E8E4', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={() => setVistaPrevia(v => !v)}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8E8E4', background: '#fff', cursor: 'pointer', color: '#444' }}>
            {vistaPrevia ? 'Ocultar vista previa' : '👁 Ver vista previa'}
          </button>
        </div>

        {vistaPrevia && (
          <div style={{ marginTop: 16, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 12 }}>VISTA PREVIA DEL MENSAJE</p>
            <pre style={{ fontSize: 13, color: '#111', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.7 }}>
              {form.mensaje_whatsapp
                .replace('{nombre}', 'Juan García')
                .replace('{mascotas}', '• Firulais: Pedigree 15kg')
                .replace('{fecha}', 'jueves 3 de abril')
                .replace('{link}', 'https://ciclopet.vercel.app/pedido/abc123')
                .replace('{negocio}', form.nombre || 'Tu Forrajería')
              }
              {form.promocion_whatsapp ? `\n\n🎁 ${form.promocion_whatsapp}` : ''}
            </pre>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={() => setForm(p => ({ ...p, mensaje_whatsapp: MENSAJE_DEFAULT }))}
            style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Restaurar mensaje original
          </button>
        </div>
      </div>

      <button onClick={guardar} disabled={guardando}
        style={{ background: guardado ? '#22C55E' : '#EA6C00', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

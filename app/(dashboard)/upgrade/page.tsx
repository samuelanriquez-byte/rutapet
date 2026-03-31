'use client'
import { useState } from 'react'

export default function UpgradePage() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function pagar() {
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/mp/crear-suscripcion', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('No pudimos generar el link de pago. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F7F5', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #E8E8E4' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 12 }}>Tu período de prueba terminó</h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          Para seguir usando RutaPet y no perder tus clientes ni tu historial de pedidos, activá tu suscripción mensual.
        </p>

        <div style={{ background: '#FFF7ED', border: '2px solid #FDDCB5', borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#EA6C00', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PLAN MENSUAL</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#EA6C00', letterSpacing: -2 }}>$29.900</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 4, marginBottom: 20 }}>ARS / mes · Todo incluido</div>
          <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {[
              'Clientes y mascotas ilimitados',
              'WhatsApp automático incluido',
              'Pedidos organizados por día',
              'Soporte prioritario',
            ].map(f => (
              <li key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, color: '#333', alignItems: 'center' }}>
                <span style={{ color: '#EA6C00', fontWeight: 700 }}>✓</span> {f}
              </li>
            ))}
          </ul>

          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={pagar}
            disabled={cargando}
            style={{ display: 'block', width: '100%', background: '#009ee3', color: '#fff', border: 'none', fontWeight: 700, padding: '14px 0', borderRadius: 10, fontSize: 15, cursor: cargando ? 'default' : 'pointer', opacity: cargando ? 0.7 : 1 }}
          >
            {cargando ? 'Cargando...' : '💳 Pagar con Mercado Pago'}
          </button>
        </div>

        <p style={{ color: '#AAA', fontSize: 13 }}>
          ¿Tenés alguna duda?{' '}
          <a href="https://wa.me/5491127130451" style={{ color: '#EA6C00', textDecoration: 'none' }}>
            Escribinos por WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function register() {
    if (!form.nombre || !form.email || !form.password) { setError('Completá todos los campos.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const slug = form.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).slice(2, 6)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError('Error al crear la cuenta. Intentá con otro email.')
      setLoading(false)
      return
    }

    // Crear negocio via API (admin client, bypasea RLS)
    if (authData.user) {
      await fetch('/api/auth/setup-negocio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authData.user.id, nombre: form.nombre, email: form.email, slug }),
      })
    }

    // Mostrar pantalla de confirmación de email
    setEmailSent(true)
    setLoading(false)
  }

  if (emailSent) return (
    <div style={{ minHeight: '100vh', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
        <h1 style={{ color: '#111', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Revisá tu email</h1>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Te mandamos un link de confirmación a <strong>{form.email}</strong>.<br />
          Hacé click en el link para activar tu cuenta.
        </p>
        <p style={{ color: '#AAA', fontSize: 12 }}>
          ¿No llegó? Revisá la carpeta de spam.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
          <h1 style={{ color: '#111', fontSize: 22, fontWeight: 800 }}>Empezá gratis</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>45 días de prueba sin tarjeta</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre de tu forrajería o negocio"
            style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 16px', color: '#111', fontSize: 14, outline: 'none' }} />
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" placeholder="Email"
            style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 16px', color: '#111', fontSize: 14, outline: 'none' }} />
          <div style={{ position: 'relative' }}>
            <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} type={showPass ? 'text' : 'password'} placeholder="Contraseña"
              style={{ width: '100%', background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 44px 12px 16px', color: '#111', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {error && <p style={{ color: '#E53E3E', fontSize: 13 }}>{error}</p>}
          <button onClick={register} disabled={loading}
            style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </div>
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: '#EA6C00', textDecoration: 'none', fontWeight: 600 }}>Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}

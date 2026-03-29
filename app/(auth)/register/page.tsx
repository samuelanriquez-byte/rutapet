'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function register() {
    if (!form.nombre || !form.email || !form.password) { setError('Completá todos los campos.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const slug = form.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).slice(2, 6)

    const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authError || !authData.user) { setError('Error al crear la cuenta. Intentá con otro email.'); setLoading(false); return }

    await supabase.from('negocios').insert({ user_id: authData.user.id, nombre: form.nombre, slug, email: form.email })
    router.push('/dashboard')
  }

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
          <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} type="password" placeholder="Contraseña"
            style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 16px', color: '#111', fontSize: 14, outline: 'none' }} />
          {error && <p style={{ color: '#E53E3E', fontSize: 13 }}>{error}</p>}
          <button onClick={register} disabled={loading}
            style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
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

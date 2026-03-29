'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos.'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A1A0C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
          <h1 style={{ color: '#F0FDF4', fontSize: 22, fontWeight: 800 }}>CicloPet</h1>
          <p style={{ color: '#4B7A5A', fontSize: 14, marginTop: 4 }}>Iniciá sesión en tu cuenta</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" onKeyDown={e => e.key === 'Enter' && login()}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#F0FDF4', fontSize: 14, outline: 'none' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && login()}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#F0FDF4', fontSize: 14, outline: 'none' }} />
          {error && <p style={{ color: '#F87171', fontSize: 13 }}>{error}</p>}
          <button onClick={login} disabled={loading}
            style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
        <p style={{ color: '#4B7A5A', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: '#4ADE80', textDecoration: 'none', fontWeight: 600 }}>Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}

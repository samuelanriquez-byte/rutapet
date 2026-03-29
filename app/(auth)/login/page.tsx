'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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
    <div style={{ minHeight: '100vh', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
          <h1 style={{ color: '#111', fontSize: 22, fontWeight: 800 }}>RutaPet</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Iniciá sesión en tu cuenta</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" onKeyDown={e => e.key === 'Enter' && login()}
            style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 16px', color: '#111', fontSize: 14, outline: 'none' }} />
          <div style={{ position: 'relative' }}>
            <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && login()}
              style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 44px 12px 16px', color: '#111', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {error && <p style={{ color: '#E53E3E', fontSize: 13 }}>{error}</p>}
          <button onClick={login} disabled={loading}
            style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: '#EA6C00', textDecoration: 'none', fontWeight: 600 }}>Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}

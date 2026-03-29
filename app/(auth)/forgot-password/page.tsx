'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError('No pudimos enviar el email. Verificá la dirección.'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
          <h1 style={{ color: '#111', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Recuperar contraseña</h1>
          <p style={{ color: '#888', fontSize: 13 }}>Te mandamos un link para resetearla</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: '#111', fontSize: 15, marginBottom: 8 }}>¡Listo! Revisá tu email</p>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Te enviamos un link a <strong>{email}</strong></p>
            <Link href="/login" style={{ color: '#EA6C00', fontSize: 13, textDecoration: 'none' }}>← Volver al login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu email" required
              style={{ background: '#F9F9F7', border: '1px solid #E8E8E4', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none' }} />
            {error && <p style={{ color: '#E53E3E', fontSize: 13 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ background: '#EA6C00', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>
              <Link href="/login" style={{ color: '#EA6C00', textDecoration: 'none' }}>← Volver al login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

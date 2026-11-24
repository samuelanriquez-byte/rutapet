import { ImageResponse } from 'next/og'

export const alt = 'RutaPet — Tus clientes siempre con alimento. Vos siempre con ventas.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1A1A1A',
          backgroundImage: 'radial-gradient(circle at 22% 18%, rgba(234,108,0,0.45), transparent 55%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 40 }}>
          <span style={{ fontSize: 76 }}>🐾</span>
          <span style={{ fontSize: 68, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>RutaPet</span>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 46,
            fontWeight: 800,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.25,
            maxWidth: 940,
          }}
        >
          Tus clientes siempre con alimento. Vos siempre con ventas.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            background: '#EA6C00',
            color: '#fff',
            fontSize: 32,
            fontWeight: 800,
            padding: '18px 44px',
            borderRadius: 18,
          }}
        >
          ✨ 45 días de prueba gratis ✨
        </div>
      </div>
    ),
    { ...size }
  )
}

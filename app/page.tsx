import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{ background: '#1C0F00', minHeight: '100vh', color: '#FFF7ED' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#F97316', letterSpacing: -0.5 }}>🐾 RutaPet</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ color: '#FDDCB5', textDecoration: 'none', fontSize: 14, padding: '8px 16px' }}>
            Iniciar sesión
          </Link>
          <Link href="/register" style={{ background: '#EA6C00', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 20px', borderRadius: 8 }}>
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: '#F97316', marginBottom: 28 }}>
          ✨ Para forrajerías y pet shops de Argentina
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24 }}>
          Tus clientes nunca<br />
          <span style={{ color: '#F97316' }}>se quedan sin alimento</span>
        </h1>
        <p style={{ fontSize: 18, color: '#FDDCB5', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px' }}>
          RutaPet avisa automáticamente por WhatsApp cuando a cada mascota le está por terminar el alimento. Tus clientes confirman el pedido y vos arrancás el día con la hoja de ruta lista.
        </p>
        <Link href="/register" style={{ display: 'inline-block', background: '#EA6C00', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 12 }}>
          Probá 14 días gratis →
        </Link>
        <p style={{ color: '#7A4A1E', fontSize: 13, marginTop: 16 }}>Sin tarjeta de crédito. Sin compromiso.</p>
      </section>

      {/* Cómo funciona */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 64, letterSpacing: -1 }}>¿Cómo funciona?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { n: '01', icon: '📋', title: 'Cargás tus clientes', desc: 'Nombre, teléfono, mascota, marca de alimento y cuántos kilos compra cada uno.' },
            { n: '02', icon: '🤖', title: 'RutaPet detecta quién necesita', desc: 'Cada día el sistema calcula a quién le está por terminar el alimento según su ciclo.' },
            { n: '03', icon: '📲', title: 'Elegís a quién mandar', desc: 'Ves la lista, filtrás por localidad y decidís a quién enviar el recordatorio.' },
            { n: '04', icon: '✅', title: 'El cliente confirma', desc: 'Recibe un WhatsApp con link. En 2 clicks confirma su pedido y elige cómo pagar.' },
            { n: '05', icon: '🚚', title: 'Repartís con todo organizado', desc: 'A primera hora tenés todos los pedidos del día listos para salir.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 11, color: '#F97316', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>PASO {step.n}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: '#FDDCB5', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Precio */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>Un solo precio, todo incluido</h2>
        <p style={{ color: '#FDDCB5', marginBottom: 48, fontSize: 16 }}>Sin sorpresas. Sin límite de clientes.</p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: 40 }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#F97316', letterSpacing: -2 }}>$35</div>
          <div style={{ color: '#FDDCB5', marginBottom: 32, fontSize: 14 }}>USD / mes · Clientes ilimitados · WhatsApp incluido</div>
          <ul style={{ textAlign: 'left', listStyle: 'none', marginBottom: 36 }}>
            {['Clientes y mascotas ilimitados', 'WhatsApp automático incluido', 'Pedidos organizados por día', 'Filtro por localidad', '14 días de prueba gratis'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#F97316' }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/register" style={{ display: 'block', background: '#EA6C00', color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '14px 0', borderRadius: 10, fontSize: 15 }}>
            Empezar ahora →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 40px', textAlign: 'center', color: '#7A4A1E', fontSize: 13 }}>
        © 2026 RutaPet · Hecho en Argentina 🇦🇷
      </footer>
    </main>
  )
}

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', color: '#111' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #F0EDE8' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#EA6C00', letterSpacing: -0.5 }}>🐾 RutaPet</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 16px' }}>
            Iniciar sesión
          </Link>
          <Link href="/register" style={{ background: '#EA6C00', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 20px', borderRadius: 8 }}>
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#FFF7ED', border: '1px solid #FDDCB5', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: '#EA6C00', marginBottom: 28, fontWeight: 600 }}>
          ✨ Para forrajerías y pet shops de Argentina
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24 }}>
          Tus clientes siempre con alimento.<br />
          <span style={{ color: '#EA6C00' }}>Vos siempre con ventas.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px' }}>
          RutaPet avisa automáticamente por WhatsApp cuando a cada mascota le está por terminar el alimento. Tus clientes confirman el pedido y vos arrancás el día con la hoja de ruta lista.
        </p>
        <Link href="/register" style={{ display: 'inline-block', background: '#EA6C00', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 12 }}>
          Probá 45 días gratis →
        </Link>
        <p style={{ color: '#AAA', fontSize: 13, marginTop: 16 }}>Sin tarjeta de crédito. Sin compromiso.</p>
      </section>

      {/* Cómo funciona */}
      <section style={{ background: '#FFF7ED', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 64, letterSpacing: -1 }}>¿Cómo funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { n: '01', icon: '📋', title: 'Cargás tus clientes', desc: 'Nombre, teléfono, mascota, marca de alimento y cuántos kilos compra cada uno.' },
              { n: '02', icon: '🤖', title: 'RutaPet detecta quién necesita', desc: 'Cada día el sistema calcula a quién le está por terminar el alimento según su ciclo.' },
              { n: '03', icon: '📲', title: 'Elegís a quién mandar', desc: 'Ves la lista, filtrás por localidad y decidís a quién enviar el recordatorio.' },
              { n: '04', icon: '✅', title: 'El cliente confirma', desc: 'Recibe un WhatsApp con link. En 2 clicks confirma su pedido y elige cómo pagar.' },
              { n: '05', icon: '🚚', title: 'Repartís con todo organizado', desc: 'A primera hora tenés todos los pedidos del día listos para salir.' },
            ].map(step => (
              <div key={step.n} style={{ background: '#fff', border: '1px solid #F0EDE8', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: 11, color: '#EA6C00', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>PASO {step.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#111' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precio */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>Un solo precio, todo incluido</h2>
        <p style={{ color: '#666', marginBottom: 48, fontSize: 16 }}>Sin sorpresas. Sin límite de clientes.</p>
        <div style={{ background: '#fff', border: '2px solid #FDDCB5', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(234,108,0,0.08)' }}>

          {/* Badge superior */}
          <div style={{ background: '#EA6C00', color: '#fff', fontSize: 12, fontWeight: 800, padding: '10px 0', textAlign: 'center', letterSpacing: 1 }}>
            PRECIO DE LANZAMIENTO · PRIMEROS 100 CLIENTES
          </div>

          <div style={{ padding: '36px 40px 40px' }}>
            {/* Precio tachado */}
            <div style={{ fontSize: 22, color: '#555', textDecoration: 'line-through', fontWeight: 700, marginBottom: 4 }}>$49.900 ARS/mes</div>

            {/* Precio actual */}
            <div style={{ fontSize: 56, fontWeight: 900, color: '#EA6C00', letterSpacing: -2, lineHeight: 1 }}>$29.900</div>
            <div style={{ color: '#888', fontSize: 14, marginTop: 6, marginBottom: 12 }}>ARS / mes · Todo incluido</div>

            {/* Ahorro — héroe */}
            <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginBottom: 4 }}>Ahorrás $20.000 por mes</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #F0EDE8' }}>🔒 Precio congelado hasta diciembre 2026</div>

            <ul style={{ textAlign: 'left', listStyle: 'none', marginBottom: 36 }}>
              {[
                'Recordatorio automático de ventas',
                'Clientes y mascotas ilimitados',
                'WhatsApp automático incluido',
                '200 mensajes a clientes por mes',
                '45 días de prueba gratis',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: '#333' }}>
                  <span style={{ color: '#EA6C00', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <Link href="/register" style={{ display: 'block', background: '#EA6C00', color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '14px 0', borderRadius: 10, fontSize: 15, textAlign: 'center' }}>
              Empezar ahora →
            </Link>
            <p style={{ fontSize: 12, color: '#AAA', marginTop: 12 }}>Sin tarjeta de crédito · Sin compromiso</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40, textAlign: 'center', letterSpacing: -1 }}>Preguntas frecuentes</h2>
        {[
          {
            q: '¿Cuánto cuesta RutaPet?',
            a: 'El precio regular es $49.900 ARS/mes. Si contratás durante el período de prueba, el precio queda congelado en $29.900 ARS/mes hasta diciembre 2026.'
          },
          {
            q: '¿Hay período de prueba?',
            a: 'Sí, 45 días completamente gratis. Sin tarjeta de crédito ni compromiso. Si no te sirve, no pagás nada.'
          },
          {
            q: '¿Los mensajes de WhatsApp tienen costo extra?',
            a: 'No. El costo de los mensajes ya está incluido en el precio mensual.'
          },
          {
            q: '¿Funciona con cualquier raza o tipo de alimento?',
            a: 'Sí. Podés cargar cualquier marca de alimento y personalizar el ciclo de compra de cada mascota según sus kilos.'
          },
          {
            q: '¿Cómo confirman el pedido los clientes?',
            a: 'Reciben un WhatsApp con un link. Con dos clicks confirman el pedido, pueden modificar los kilos y elegir cómo pagar. No necesitan instalar nada.'
          },
          {
            q: '¿Puedo usarlo si tengo clientes en distintas zonas?',
            a: 'Sí. Podés filtrar los recordatorios por localidad para organizar mejor los repartos por día.'
          },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid #F0EDE8', padding: '24px 0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#111' }}>{q}</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>{a}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #F0EDE8', padding: '32px 40px', textAlign: 'center', color: '#BBB', fontSize: 13 }}>
        © 2026 RutaPet · Hecho en Argentina 🇦🇷
      </footer>
    </main>
  )
}

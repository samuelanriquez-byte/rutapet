import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F7F5' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #E8E8E4', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #E8E8E4', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#EA6C00' }}>🐾 CicloPet</span>
        </div>
        {[
          { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
          { href: '/clientes', icon: '👥', label: 'Clientes' },
          { href: '/configuracion', icon: '⚙️', label: 'Configuración' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', fontSize: 14, color: '#444', textDecoration: 'none', fontWeight: 500 }}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </aside>
      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

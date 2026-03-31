'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/clientes', icon: '👥', label: 'Clientes' },
    { href: '/configuracion', icon: '⚙️', label: 'Configuración' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F7F5' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #E8E8E4', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #E8E8E4', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#EA6C00' }}>🐾 RutaPet</span>
        </div>
        {items.map(item => {
          const activo = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
              fontSize: 14, textDecoration: 'none', fontWeight: activo ? 700 : 500,
              color: activo ? '#EA6C00' : '#444',
              background: activo ? '#FFF7ED' : 'transparent',
              borderRight: activo ? '3px solid #EA6C00' : '3px solid transparent',
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          )
        })}
      </aside>
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

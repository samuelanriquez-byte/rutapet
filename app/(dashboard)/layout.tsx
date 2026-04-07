'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/clientes', icon: '👥', label: 'Clientes' },
  { href: '/configuracion', icon: '⚙️', label: 'Config' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col md:flex-row">

      {/* Sidebar — solo desktop */}
      <aside className="hidden md:flex flex-col w-[220px] bg-white border-r border-[#E8E8E4] shrink-0">
        <div className="px-5 py-6 border-b border-[#E8E8E4]">
          <span className="text-lg font-extrabold text-[#EA6C00]">🐾 RutaPet</span>
        </div>
        <nav className="flex flex-col mt-2">
          {items.map(item => {
            const activo = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-5 py-3 text-sm no-underline transition-colors"
                style={{
                  fontWeight: activo ? 700 : 500,
                  color: activo ? '#EA6C00' : '#444',
                  background: activo ? '#FFF7ED' : 'transparent',
                  borderRight: activo ? '3px solid #EA6C00' : '3px solid transparent',
                }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Header mobile — solo mobile */}
      <header className="md:hidden flex items-center px-4 py-3 bg-white border-b border-[#E8E8E4] sticky top-0 z-10">
        <span className="text-base font-extrabold text-[#EA6C00]">🐾 RutaPet</span>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — solo mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E4] flex z-10">
        {items.map(item => {
          const activo = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 no-underline transition-colors gap-0.5"
              style={{ color: activo ? '#EA6C00' : '#888' }}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-semibold">{item.label}</span>
              {activo && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#EA6C00] rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

    </div>
  )
}

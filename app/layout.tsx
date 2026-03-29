import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CicloPet — Fidelizá a tus clientes automáticamente',
  description: 'Enviá recordatorios automáticos por WhatsApp a tus clientes antes de que se queden sin alimento. Organizá tus repartos y aumentá tus ventas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

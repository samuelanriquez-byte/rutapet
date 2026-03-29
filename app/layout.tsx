import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RutaPet — Fidelizá a tus clientes automáticamente',
  description: 'Enviá recordatorios automáticos por WhatsApp a tus clientes antes de que se queden sin alimento. Organizá tus repartos y aumentá tus ventas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

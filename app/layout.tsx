import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const title = 'RutaPet — Fidelizá a tus clientes automáticamente'
const description = 'RutaPet avisa automáticamente por WhatsApp cuando a cada mascota le está por terminar el alimento. 45 días de prueba gratis, sin tarjeta.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rutapets.com'),
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://www.rutapets.com',
    siteName: 'RutaPet',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

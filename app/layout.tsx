import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const title = 'RutaPet — Fidelizá a tus clientes automáticamente'
const shareTitle = '¿Vendés alimentos para mascotas? ¡No pierdas más clientes!'
const shareDescription = 'RutaPet avisa por WhatsApp antes de que a tu cliente se le termine el alimento. 45 días de prueba gratis, sin tarjeta.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rutapets.com'),
  title,
  description: shareDescription,
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: 'https://www.rutapets.com',
    siteName: 'RutaPet',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

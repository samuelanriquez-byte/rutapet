import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { userId, nombre, email, whatsapp, slug } = await req.json()
  if (!userId || !nombre || !slug) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  const supabase = createAdminClient()

  // Si ya existe negocio para este usuario, no crear otro
  const { data: existing } = await supabase.from('negocios').select('id').eq('user_id', userId).single()
  if (existing) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('negocios').insert({ user_id: userId, nombre, slug, email, whatsapp })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notificar nuevo registro
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
    await resend.emails.send({
      from: 'RutaPet <noreply@rutapets.com>',
      to: ['samuelanriquez@gmail.com', 'contact.rutapet@gmail.com'],
      subject: `🐾 Nuevo registro en RutaPet — ${nombre}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#EA6C00;">🐾 Nuevo forrajero registrado</h2>
          <p><strong>Negocio:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email || '—'}</p>
          <p><strong>Slug:</strong> ${slug}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
        </div>
      `,
    })
  }

  return NextResponse.json({ ok: true })
}

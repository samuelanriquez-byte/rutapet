import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { enviarEmailForrajero, templatePedidosDia } from '@/lib/email'

// Cron: 8:00 Argentina = 11:00 UTC
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rutapets.com'

  const hoy = new Date()
  const fechaStr = hoy.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const hoyISO = hoy.toISOString().split('T')[0]

  const { data: negocios } = await admin
    .from('negocios')
    .select('id, nombre, email, plan, trial_ends_at')
    .not('email', 'is', null)

  if (!negocios) return NextResponse.json({ ok: true, enviados: 0 })

  let enviados = 0

  for (const negocio of negocios) {
    if (negocio.plan === 'trial' && negocio.trial_ends_at && new Date(negocio.trial_ends_at) < new Date()) continue

    const { data: pedidos } = await admin
      .from('pedidos')
      .select('*, clientes(nombre, direccion), mascotas(nombre, kilos)')
      .eq('negocio_id', negocio.id)
      .eq('estado', 'confirmado')
      .gte('fecha_entrega', hoyISO)
      .lt('fecha_entrega', hoyISO + 'T23:59:59')

    if (!pedidos || pedidos.length === 0) continue

    const pedidosFormateados = pedidos.map((p: any) => ({
      cliente_nombre: p.clientes?.nombre,
      mascota_nombre: p.mascotas?.nombre,
      kilos: p.mascotas?.kilos,
      direccion: p.clientes?.direccion,
      estado: p.estado,
      metodo_pago: p.metodo_pago,
    }))

    const html = templatePedidosDia({
      negocioNombre: negocio.nombre,
      fecha: fechaStr,
      pedidos: pedidosFormateados,
      baseUrl,
      tipo: 'manana',
    })

    const ok = await enviarEmailForrajero({
      to: negocio.email,
      subject: `☀️ Pedidos de hoy — ${fechaStr}`,
      html,
    })

    if (ok) enviados++
  }

  return NextResponse.json({ ok: true, enviados })
}

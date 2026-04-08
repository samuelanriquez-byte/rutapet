import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { enviarEmailForrajero, templatePedidosDia } from '@/lib/email'

// Cron: 22:30 Argentina = 01:30 UTC (Argentina es UTC-3)
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rutapets.com'

  // Fecha de mañana en Argentina
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaStr = manana.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const mananaISO = manana.toISOString().split('T')[0]

  // Traer todos los negocios activos con email
  const { data: negocios } = await admin
    .from('negocios')
    .select('id, nombre, email, plan, trial_ends_at')
    .not('email', 'is', null)

  if (!negocios) return NextResponse.json({ ok: true, enviados: 0 })

  let enviados = 0

  for (const negocio of negocios) {
    // Saltar si trial vencido
    if (negocio.plan === 'trial' && negocio.trial_ends_at && new Date(negocio.trial_ends_at) < new Date()) continue

    // Traer pedidos confirmados para mañana
    const { data: pedidos } = await admin
      .from('pedidos')
      .select('*, clientes(nombre, direccion), mascotas(nombre, kilos)')
      .eq('negocio_id', negocio.id)
      .eq('estado', 'confirmado')
      .gte('fecha_entrega', mananaISO)
      .lt('fecha_entrega', mananaISO + 'T23:59:59')

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
      tipo: 'noche',
    })

    const ok = await enviarEmailForrajero({
      to: negocio.email,
      subject: `📦 Pedidos de mañana — ${fechaStr}`,
      html,
    })

    if (ok) enviados++
  }

  return NextResponse.json({ ok: true, enviados })
}

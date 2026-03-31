import { NextRequest, NextResponse } from 'next/server'
import { obtenerPago } from '@/lib/mercadopago'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP manda type=payment cuando se aprueba un pago
    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const pago = await obtenerPago(String(paymentId))
    if (pago.status !== 'approved') return NextResponse.json({ ok: true })

    // externalRef = "suscripcion_{negocioId}"
    const externalRef = pago.external_reference || ''
    const negocioId = externalRef.replace('suscripcion_', '')
    if (!negocioId) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()

    // Extender 30 días desde hoy
    const proximoPago = new Date()
    proximoPago.setDate(proximoPago.getDate() + 30)

    await supabase.from('negocios').update({
      plan: 'monthly',
      trial_ends_at: proximoPago.toISOString(),
    }).eq('id', negocioId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('MP webhook error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// MP también manda GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ ok: true })
}

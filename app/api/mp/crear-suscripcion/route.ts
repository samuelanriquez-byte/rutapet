import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { crearPreferencia } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
    if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ciclopet.vercel.app'

    const preferencia = await crearPreferencia({
      titulo: 'RutaPet',
      monto: 29900,
      negocioId: negocio.id,
      externalRef: `suscripcion_${negocio.id}`,
      backUrl: `${baseUrl}/dashboard`,
    })

    if (!preferencia.init_point) {
      console.error('MP error:', JSON.stringify(preferencia))
      return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 })
    }

    return NextResponse.json({ url: preferencia.init_point })
  } catch (err) {
    console.error('Error crear suscripcion MP:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

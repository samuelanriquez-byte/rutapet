import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsApp } from '@/lib/twilio'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rutapet.com.ar'

export async function POST(req: NextRequest) {
  try {
    const { pedidoId } = await req.json()
    const supabase = createAdminClient()

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('*, clientes(*, mascotas(*))')
      .eq('id', pedidoId)
      .single()

    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const cliente = pedido.clientes as any
    if (!cliente?.telefono) return NextResponse.json({ error: 'Sin teléfono' }, { status: 400 })

    const { data: negocio } = await supabase
      .from('negocios')
      .select('nombre, mensaje_whatsapp, promocion_whatsapp')
      .eq('id', pedido.negocio_id)
      .single()

    const fechaFormateada = new Date(pedido.fecha_entrega + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    const mascotasTexto = (cliente.mascotas || [])
      .map((m: any) => `• ${m.nombre}: ${m.marca_alimento} ${m.kilos}kg`)
      .join('\n')

    const link = `${BASE_URL}/pedido/${pedido.token}`

    const plantilla = negocio?.mensaje_whatsapp ||
      `¡Hola {nombre}! 👋\n\nTe recordamos que a tu mascota le está por terminar el alimento:\n\n{mascotas}\n\n*{negocio}* estará repartiendo el *{fecha}* por tu zona.\n\nConfirmá tu pedido acá 👇\n{link}\n\n_Podés modificar cantidad, peso o dirección hasta 8hs antes de la entrega._`

    let mensaje = plantilla
      .replace('{nombre}', cliente.nombre)
      .replace('{mascotas}', mascotasTexto)
      .replace('{fecha}', fechaFormateada)
      .replace('{link}', link)
      .replace('{negocio}', negocio?.nombre || '')

    if (negocio?.promocion_whatsapp) {
      mensaje += `\n\n🎁 ${negocio.promocion_whatsapp}`
    }

    await sendWhatsApp(cliente.telefono, mensaje)
    await supabase.from('clientes').update({ ultimo_whatsapp_fecha: new Date().toISOString() }).eq('id', cliente.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error reenviar WhatsApp:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

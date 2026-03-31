import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsApp } from '@/lib/twilio'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rutapet.com.ar'

export async function POST(req: NextRequest) {
  try {
    const { negocioId, clienteIds } = await req.json()
    if (!negocioId || !clienteIds?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: negocio } = await supabase.from('negocios').select('nombre, metodos_pago, mensaje_whatsapp, promocion_whatsapp').eq('id', negocioId).single()

    let enviados = 0
    const mañana = new Date()
    mañana.setDate(mañana.getDate() + 1)
    const fechaEntrega = mañana.toISOString().split('T')[0]
    const fechaFormateada = mañana.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

    for (const clienteId of clienteIds) {
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*, mascotas(*)')
          .eq('id', clienteId)
          .single()

        if (!cliente?.telefono) continue

        // Crear pedido con token único
        const { data: pedido } = await supabase
          .from('pedidos')
          .insert({ negocio_id: negocioId, cliente_id: clienteId, fecha_entrega: fechaEntrega, estado: 'pendiente', whatsapp_enviado: true, whatsapp_enviado_at: new Date().toISOString() })
          .select()
          .single()

        if (!pedido) continue

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
        enviados++
      } catch (err) {
        console.error(`Error enviando a cliente ${clienteId}:`, err)
      }
    }

    return NextResponse.json({ ok: true, enviados })
  } catch (err) {
    console.error('Error enviar WhatsApp:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

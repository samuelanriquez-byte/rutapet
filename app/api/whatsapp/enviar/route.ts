import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsApp } from '@/lib/twilio'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ciclopet.com.ar'

export async function POST(req: NextRequest) {
  try {
    const { negocioId, clienteIds } = await req.json()
    if (!negocioId || !clienteIds?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: negocio } = await supabase.from('negocios').select('nombre, metodos_pago').eq('id', negocioId).single()

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

        const mensaje =
          `¡Hola ${cliente.nombre}! 👋\n\n` +
          `Te recordamos que a tu${(cliente.mascotas?.length || 0) > 1 ? 's mascotas les' : ' mascota le'} está por terminar el alimento:\n\n` +
          `${mascotasTexto}\n\n` +
          `*${negocio?.nombre}* estará repartiendo el *${fechaFormateada}* por tu zona.\n\n` +
          `Confirmá tu pedido acá 👇\n${link}\n\n` +
          `_Podés modificar la cantidad hasta 8hs antes de la entrega._`

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

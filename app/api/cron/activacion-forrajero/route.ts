import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import twilio from 'twilio'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_NUMBER
  const templateSid = process.env.TWILIO_ACTIVACION_TEMPLATE_SID

  if (!accountSid || !authToken || !from || !templateSid) {
    return NextResponse.json({ error: 'Twilio no configurado' }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Forrajeros que se registraron hace exactamente 3 días y tienen 0 clientes
  const hace3dias = new Date()
  hace3dias.setDate(hace3dias.getDate() - 3)
  const desde = new Date(hace3dias)
  desde.setHours(0, 0, 0, 0)
  const hasta = new Date(hace3dias)
  hasta.setHours(23, 59, 59, 999)

  const { data: negocios } = await supabase
    .from('negocios')
    .select('id, nombre, whatsapp')
    .gte('created_at', desde.toISOString())
    .lte('created_at', hasta.toISOString())
    .not('whatsapp', 'is', null)

  if (!negocios || negocios.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const client = twilio(accountSid, authToken)
  let enviados = 0

  for (const negocio of negocios) {
    // Verificar que no tenga clientes cargados
    const { count } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocio.id)

    if (count && count > 0) continue

    try {
      const numero = negocio.whatsapp.startsWith('+') ? negocio.whatsapp : `+${negocio.whatsapp}`
      await client.messages.create({
        from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        to: `whatsapp:${numero}`,
        contentSid: templateSid,
        contentVariables: JSON.stringify({ '1': negocio.nombre }),
      })
      enviados++
    } catch (err) {
      console.error(`Error enviando a ${negocio.nombre}:`, err)
    }
  }

  return NextResponse.json({ ok: true, enviados })
}

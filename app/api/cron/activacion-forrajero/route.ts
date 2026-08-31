import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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

  let enviados = 0

  for (const negocio of negocios) {
    // Verificar que no tenga clientes cargados
    const { count } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocio.id)

    if (count && count > 0) continue

    try {
      const numero = negocio.whatsapp.startsWith('+') ? negocio.whatsapp : `+${negocio.whatsapp.replace(/\D/g, '')}`
      const params: Record<string, string> = {
        From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        To: `whatsapp:${numero}`,
        ContentSid: templateSid,
        ContentVariables: JSON.stringify({ '1': negocio.nombre }),
      }

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(params).toString(),
        }
      )

      if (res.ok) enviados++
    } catch (err) {
      console.error(`Error enviando a ${negocio.nombre}:`, err)
    }
  }

  return NextResponse.json({ ok: true, enviados })
}

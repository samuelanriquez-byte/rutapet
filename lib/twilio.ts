function formatPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '')

  // Quitar prefijo internacional si ya está
  if (digits.startsWith('549')) return `+${digits}`
  if (digits.startsWith('54')) digits = digits.slice(2)

  // Quitar 0 inicial
  if (digits.startsWith('0')) digits = digits.slice(1)

  // Si tiene 11 dígitos, tiene el 15 — hay que quitarlo
  // Ej: 1112345678 (10 dígitos, CABA) → ok
  // Ej: 11151234567 (11 dígitos, CABA con 15) → quitar el 15
  // Ej: 2664123456 (10 dígitos, interior) → ok
  // Ej: 266415123456 (12 dígitos, interior con 0 y 15) — ya quitamos el 0
  if (digits.length === 11) {
    // CABA: área 11 (2 dígitos) + 15 + 7 dígitos
    if (digits.startsWith('11')) {
      digits = digits.slice(0, 2) + digits.slice(4)
    } else {
      // Interior: área 3 dígitos + 15 + 6 o 7 dígitos
      digits = digits.slice(0, 3) + digits.slice(5)
    }
  }

  return `+549${digits}`
}

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_NUMBER

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio no configurado')
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        To: `whatsapp:${formatPhone(to)}`,
        Body: message,
      }).toString(),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Twilio error: ${error}`)
  }
}

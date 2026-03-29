function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('549')) return `+${digits}`
  if (digits.startsWith('54')) return `+${digits}`
  if (digits.startsWith('0')) return `+54${digits.slice(1)}`
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
        From: `whatsapp:${from}`,
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

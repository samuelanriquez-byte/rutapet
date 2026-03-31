const MP_BASE = 'https://api.mercadopago.com'
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!

export async function crearPreferencia(params: {
  titulo: string
  monto: number
  negocioId: string
  externalRef: string
  backUrl: string
}) {
  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{
        title: params.titulo,
        quantity: 1,
        unit_price: params.monto,
        currency_id: 'ARS',
      }],
      back_urls: {
        success: params.backUrl,
        failure: params.backUrl,
        pending: params.backUrl,
      },
      auto_return: 'approved',
      external_reference: params.externalRef,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mp/webhook`,
    }),
  })
  return res.json()
}

export async function obtenerPago(paymentId: string) {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })
  return res.json()
}

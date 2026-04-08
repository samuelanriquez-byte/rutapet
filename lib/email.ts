import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailForrajero({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: 'RutaPet <noreply@rutapets.com>',
    to,
    subject,
    html,
  })
  if (error) console.error('Error enviando email:', error)
  return !error
}

export function templatePedidosDia({
  negocioNombre,
  fecha,
  pedidos,
  baseUrl,
  tipo,
}: {
  negocioNombre: string
  fecha: string
  pedidos: any[]
  baseUrl: string
  tipo: 'noche' | 'manana'
}) {
  const titulo = tipo === 'noche'
    ? `📦 Pedidos para repartir mañana — ${fecha}`
    : `☀️ Recordatorio: pedidos de hoy — ${fecha}`

  const subtitulo = tipo === 'noche'
    ? 'Estos son los pedidos confirmados para mañana:'
    : 'Estos son los pedidos que tenés que repartir hoy:'

  const filas = pedidos.length === 0
    ? `<tr><td colspan="4" style="padding:20px;text-align:center;color:#888;">Sin pedidos confirmados por ahora.</td></tr>`
    : pedidos.map(p => `
      <tr style="border-bottom:1px solid #F3F3F0;">
        <td style="padding:10px 12px;font-size:14px;font-weight:600;color:#111;">${p.cliente_nombre || '—'}</td>
        <td style="padding:10px 12px;font-size:13px;color:#555;">${p.mascota_nombre || '—'} · ${p.kilos || '?'}kg</td>
        <td style="padding:10px 12px;font-size:13px;color:#555;">${p.direccion || '—'}</td>
        <td style="padding:10px 12px;font-size:13px;">
          <span style="background:${p.estado === 'confirmado' ? '#F0FDF4' : '#FFF7ED'};color:${p.estado === 'confirmado' ? '#16A34A' : '#EA6C00'};padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px;">
            ${p.estado}
          </span>
        </td>
      </tr>
    `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F7F7F5;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

        <!-- Header -->
        <div style="background:#EA6C00;border-radius:16px 16px 0 0;padding:24px 28px;">
          <div style="font-size:22px;font-weight:900;color:#fff;">🐾 RutaPet</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">${negocioNombre}</div>
        </div>

        <!-- Body -->
        <div style="background:#fff;padding:28px;border-radius:0 0 16px 16px;border:1px solid #E8E8E4;border-top:none;">
          <h2 style="font-size:18px;font-weight:800;color:#111;margin:0 0 6px;">${titulo}</h2>
          <p style="font-size:14px;color:#666;margin:0 0 24px;">${subtitulo}</p>

          <!-- Tabla pedidos -->
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E8E8E4;border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#F7F7F5;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Cliente</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Mascota / Kilos</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Dirección</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Estado</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>

          <!-- Total -->
          <div style="margin-top:16px;padding:12px 16px;background:#FFF7ED;border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;color:#EA6C00;font-weight:700;">Total pedidos</span>
            <span style="font-size:20px;font-weight:900;color:#EA6C00;">${pedidos.length}</span>
          </div>

          <!-- CTA -->
          <div style="margin-top:24px;text-align:center;">
            <a href="${baseUrl}/dashboard" style="background:#EA6C00;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
              Ver pedidos en RutaPet →
            </a>
          </div>
        </div>

        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:20px;">RutaPet · rutapets.com</p>
      </div>
    </body>
    </html>
  `
}

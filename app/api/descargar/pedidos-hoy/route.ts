import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: negocio } = await admin.from('negocios').select('id,nombre').eq('user_id', user.id).single()
  if (!negocio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const hoyISO = new Date().toISOString().split('T')[0]

  const { data: pedidos } = await admin
    .from('pedidos')
    .select('*, clientes(nombre, telefono, direccion, localidad, mascotas(*))')
    .eq('negocio_id', negocio.id)
    .eq('estado', 'confirmado')
    .gte('fecha_entrega', hoyISO)
    .lt('fecha_entrega', hoyISO + 'T23:59:59')
    .order('created_at')

  const filas = [['Cliente', 'Teléfono', 'Dirección', 'Localidad', 'Mascota', 'Marca', 'Kilos', 'Pago', 'Estado']]

  for (const p of pedidos || []) {
    const cliente = (p as any).clientes || {}
    const mascotas = cliente.mascotas || []
    const nombresMascotas = mascotas.map((m: any) => m.nombre).join(' · ')
    const marcasAlimento = mascotas.map((m: any) => m.marca_alimento).join(' · ')
    const kilosTotal = mascotas.map((m: any) => `${m.nombre}: ${p.kilos_override?.[m.id] ?? m.kilos}kg`).join(' · ')
    filas.push([
      cliente.nombre || '',
      cliente.telefono || '',
      cliente.direccion || '',
      cliente.localidad || '',
      nombresMascotas,
      marcasAlimento,
      kilosTotal,
      p.metodo_pago || '',
      p.estado || '',
    ])
  }

  const csv = filas.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-hoy-${fecha}.csv"`,
    },
  })
}

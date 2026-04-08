import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: negocio } = await admin.from('negocios').select('id,nombre').eq('user_id', user.id).single()
  if (!negocio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: clientes } = await admin
    .from('clientes')
    .select('*, mascotas(*)')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  const filas = [['Nombre', 'Teléfono', 'Dirección', 'Localidad', 'Mascota', 'Marca', 'Kilos', 'Ciclo (días)', 'Último pedido']]

  for (const c of clientes || []) {
    if (!c.mascotas || c.mascotas.length === 0) {
      filas.push([c.nombre, c.telefono || '', c.direccion || '', c.localidad || '', '', '', '', '', ''])
    } else {
      for (const m of c.mascotas) {
        filas.push([c.nombre, c.telefono || '', c.direccion || '', c.localidad || '', m.nombre || '', m.marca || '', m.kilos || '', m.ciclo_dias || '', c.ultimo_whatsapp_fecha ? new Date(c.ultimo_whatsapp_fecha).toLocaleDateString('es-AR') : ''])
      }
    }
  }

  const csv = filas.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="clientes-${negocio.nombre}-${fecha}.csv"`,
    },
  })
}

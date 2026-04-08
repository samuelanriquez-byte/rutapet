import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const negocioId = req.nextUrl.searchParams.get('id')
  const negocioNombre = req.nextUrl.searchParams.get('nombre') || 'negocio'
  if (!negocioId) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const admin = createAdminClient()
  const { data: clientes } = await admin
    .from('clientes')
    .select('*, mascotas(*)')
    .eq('negocio_id', negocioId)
    .order('nombre')

  const filas = [['Nombre', 'Teléfono', 'Dirección', 'Localidad', 'Mascota', 'Marca', 'Kilos', 'Ciclo (días)']]

  for (const c of clientes || []) {
    if (!c.mascotas || c.mascotas.length === 0) {
      filas.push([c.nombre, c.telefono || '', c.direccion || '', c.localidad || '', '', '', '', ''])
    } else {
      for (const m of c.mascotas) {
        filas.push([c.nombre, c.telefono || '', c.direccion || '', c.localidad || '', m.nombre || '', m.marca || '', m.kilos || '', m.ciclo_dias || ''])
      }
    }
  }

  const csv = filas.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="clientes-${negocioNombre}-${fecha}.csv"`,
    },
  })
}

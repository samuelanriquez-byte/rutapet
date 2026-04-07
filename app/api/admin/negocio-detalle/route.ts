import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const negocioId = req.nextUrl.searchParams.get('id')
  if (!negocioId) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const admin = createAdminClient()

  const [{ data: negocio }, { data: clientes }, { data: pedidos }] = await Promise.all([
    admin.from('negocios').select('*').eq('id', negocioId).single(),
    admin.from('clientes').select('*, mascotas(*)').eq('negocio_id', negocioId).order('nombre'),
    admin.from('pedidos').select('*').eq('negocio_id', negocioId).order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({ negocio, clientes, pedidos })
}

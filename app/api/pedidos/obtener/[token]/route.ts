import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('token', token)
    .single()

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const [{ data: cliente }, { data: mascotas }, { data: negocio }] = await Promise.all([
    supabaseAdmin.from('clientes').select('*').eq('id', pedido.cliente_id).single(),
    supabaseAdmin.from('mascotas').select('*').eq('cliente_id', pedido.cliente_id),
    supabaseAdmin.from('negocios').select('id, nombre, whatsapp, metodos_pago, marcas_alimento').eq('id', pedido.negocio_id).single(),
  ])

  return NextResponse.json({ pedido, cliente, mascotas, negocio })
}

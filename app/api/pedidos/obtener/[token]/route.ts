import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*')
    .eq('token', token)
    .single()

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const [{ data: cliente }, { data: mascotas }, { data: negocio }] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', pedido.cliente_id).single(),
    supabase.from('mascotas').select('*').eq('cliente_id', pedido.cliente_id),
    supabase.from('negocios').select('id, nombre, whatsapp, metodos_pago, marcas_alimento, alias_mercadopago, telefono_comprobantes').eq('id', pedido.negocio_id).single(),
  ])

  return NextResponse.json({ pedido, cliente, mascotas, negocio })
}

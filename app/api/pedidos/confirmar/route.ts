import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { token, metodoPago, kilosOverride, marcasOverride, direccion, notas } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: pedido } = await supabase.from('pedidos').select('*, clientes(ciclo_dias)').eq('token', token).single()
    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    if (pedido.estado === 'confirmado') return NextResponse.json({ ok: true, yaConfirmado: true })

    // Verificar que no hayan pasado 8hs desde la entrega
    const fechaEntrega = new Date(pedido.fecha_entrega + 'T00:00:00')
    const limiteModificacion = new Date(fechaEntrega.getTime() - 8 * 60 * 60 * 1000)
    if (new Date() > limiteModificacion) {
      return NextResponse.json({ error: 'Ya no se puede modificar — contactá directamente a la forrajería por WhatsApp.' }, { status: 400 })
    }

    const modificado = kilosOverride && Object.keys(kilosOverride).length > 0

    await supabase.from('pedidos').update({
      estado: 'confirmado',
      metodo_pago: metodoPago,
      kilos_override: kilosOverride || null,
      notas: notas || null,
      modificado,
      confirmado_at: new Date().toISOString(),
    }).eq('token', token)

    // Actualizar cliente: último pedido, domicilio si cambió
    const clienteUpdate: any = { ultimo_pedido_fecha: pedido.fecha_entrega }
    if (direccion) clienteUpdate.direccion = direccion
    await supabase.from('clientes').update(clienteUpdate).eq('id', pedido.cliente_id)

    // Actualizar marcas por mascota si cambiaron
    if (marcasOverride) {
      for (const [mascotaId, marca] of Object.entries(marcasOverride)) {
        if (marca) await supabase.from('mascotas').update({ marca_alimento: marca }).eq('id', mascotaId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error confirmar pedido:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

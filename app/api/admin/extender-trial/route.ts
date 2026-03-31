import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { negocioId, dias } = await req.json()
  const admin = createAdminClient()

  const { data: negocio } = await admin.from('negocios').select('trial_ends_at').eq('id', negocioId).single()
  if (!negocio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const base = new Date(negocio.trial_ends_at) > new Date() ? new Date(negocio.trial_ends_at) : new Date()
  base.setDate(base.getDate() + dias)

  await admin.from('negocios').update({ trial_ends_at: base.toISOString(), plan: 'trial' }).eq('id', negocioId)

  return NextResponse.json({ ok: true })
}

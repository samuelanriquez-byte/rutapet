import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { negocioId, plan } = await req.json()
  const admin = createAdminClient()

  const update: any = { plan }
  if (plan === 'monthly') {
    const proximos30 = new Date()
    proximos30.setDate(proximos30.getDate() + 30)
    update.trial_ends_at = proximos30.toISOString()
  }
  if (plan === 'gratis') {
    const lejano = new Date('2099-01-01')
    update.trial_ends_at = lejano.toISOString()
  }

  await admin.from('negocios').update(update).eq('id', negocioId)

  return NextResponse.json({ ok: true })
}

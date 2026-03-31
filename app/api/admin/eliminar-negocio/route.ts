import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { negocioId } = await req.json()
  const admin = createAdminClient()

  await admin.from('negocios').delete().eq('id', negocioId)

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { userId, nombre, email, slug } = await req.json()
  if (!userId || !nombre || !slug) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  const supabase = createAdminClient()

  // Si ya existe negocio para este usuario, no crear otro
  const { data: existing } = await supabase.from('negocios').select('id').eq('user_id', userId).single()
  if (existing) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('negocios').insert({ user_id: userId, nombre, slug, email })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

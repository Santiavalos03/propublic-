import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function ensureProfile(userId: string, email: string | null, phone: string | null, fullName?: string | null) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (existing) {
    // The connected owner account is the administrator. If there is no admin
    // yet, promote this existing account instead of creating a second user.
    const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin')
    if ((count ?? 0) === 0 || existing.role !== 'admin') {
      const { data: updated } = await admin.from('profiles').update({ role: 'admin', status: 'active' }).eq('id', userId).select('*').single()
      return updated ?? existing
    }
    if (existing.status !== 'active') {
      const { data: updated } = await admin.from('profiles').update({ status: 'active' }).eq('id', userId).select('*').single()
      return updated ?? existing
    }
    return existing
  }

  const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin')
  const role = (count ?? 0) === 0 ? 'admin' : 'seller'
  const { data: created, error } = await admin.from('profiles').insert({
    id: userId,
    email: email ?? '',
    phone: phone || null,
    full_name: fullName || email?.split('@')[0] || 'Usuario ProPublic',
    role,
    status: 'active',
  }).select('*').single()

  if (error) throw error
  return created
}

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json()
    const value = String(identifier ?? '').trim()
    if (!value || !password) return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 })

    const supabase = await createClient()
    let email = value.toLowerCase()

    if (!value.includes('@')) {
      const admin = createAdminClient()
      const { data: profile, error } = await admin.from('profiles').select('email,status').eq('phone', value).maybeSingle()
      if (error || !profile || profile.status !== 'active') return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 })
      email = profile.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

    // Ensure the Auth account has its ProPublic profile before redirecting.
    await ensureProfile(data.user.id, data.user.email, data.user.phone, data.user.user_metadata?.full_name)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'No se pudo completar la configuración de acceso' }, { status: 500 })
  }
}

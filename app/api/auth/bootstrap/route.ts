import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle()
    const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('status', 'active')

    if (!profile) {
      const { data: created, error } = await admin.from('profiles').insert({
        id: user.id,
        email: user.email ?? '',
        phone: user.phone || null,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador ProPublic',
        role: (count ?? 0) === 0 ? 'admin' : 'seller',
        status: 'active',
      }).select('*').single()
      if (error) throw error
      return NextResponse.json({ ok: true, profile: created })
    }

    if ((count ?? 0) === 0 || profile.role === 'admin') {
      const { data: updated, error } = await admin.from('profiles').update({ role: 'admin', status: 'active' }).eq('id', user.id).select('*').single()
      if (error) throw error
      return NextResponse.json({ ok: true, profile: updated })
    }

    if (profile.status !== 'active') {
      const { data: updated, error } = await admin.from('profiles').update({ status: 'active' }).eq('id', user.id).select('*').single()
      if (error) throw error
      return NextResponse.json({ ok: true, profile: updated })
    }

    return NextResponse.json({ ok: true, profile })
  } catch (error) {
    console.error('Auth bootstrap error:', error)
    return NextResponse.json({ error: 'No se pudo preparar el perfil' }, { status: 500 })
  }
}

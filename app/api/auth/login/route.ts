import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json()
    const value = String(identifier ?? '').trim()

    if (!value || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 })
    }

    const supabase = await createClient()

    // For email login, authenticate directly with Supabase Auth.
    // The previous implementation always queried profiles with the
    // service-role key first, so a missing Vercel service-role variable
    // caused every email login to become a generic 500 error.
    if (value.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({
        email: value.toLowerCase(),
        password,
      })

      if (error) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
      }

      return NextResponse.json({ ok: true })
    }

    // Phone login still needs the admin client to resolve the phone to
    // the email used by Supabase Auth.
    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email,status')
      .eq('phone', value)
      .maybeSingle()

    if (profileError) {
      console.error('Phone login profile lookup failed:', profileError)
      return NextResponse.json({ error: 'No se pudo consultar el usuario' }, { status: 500 })
    }

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 })
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}

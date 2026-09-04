import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Sesión incompleta' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error || !data.user) {
      console.error('Session sync failed:', error)
      return NextResponse.json({ error: 'No se pudo sincronizar la sesión' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, userId: data.user.id })
  } catch (error) {
    console.error('Session route error:', error)
    return NextResponse.json({ error: 'Error al sincronizar la sesión' }, { status: 500 })
  }
}

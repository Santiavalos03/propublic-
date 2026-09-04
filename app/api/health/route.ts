import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    supabase_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabase_anon_key: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    service_role_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    database: false,
    auth: false,
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('company_settings').select('id').limit(1)
    checks.database = !error
    const { error: authError } = await supabase.auth.getUser()
    checks.auth = !authError
  } catch {}

  const ok = checks.supabase_url && checks.supabase_anon_key && checks.database
  return NextResponse.json({ ok, checks, timestamp: new Date().toISOString() }, { status: ok ? 200 : 503 })
}

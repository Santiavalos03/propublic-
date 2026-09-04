import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type CurrentProfile = {
  id: string
  email: string
  phone: string | null
  full_name: string
  role: 'admin' | 'vendedor' | 'disenador' | 'produccion'
  active: boolean
  created_at?: string
  updated_at?: string
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) return null

  return {
    ...profile,
    email: user.email ?? '',
    active: Boolean(profile.active),
  } as CurrentProfile
}

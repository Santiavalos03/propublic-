import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type CurrentProfile = {
  id: string
  email: string
  phone: string | null
  full_name: string
  role: 'admin' | 'seller' | 'designer' | 'production'
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Normal path: the Auth trigger should have created this profile and RLS
  // allows the signed-in user to read its own row.
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) {
    // Owner promotion is best-effort and only uses the service-role key on the
    // server. Never block an authenticated user if that optional key is absent.
    try {
      const admin = createAdminClient()
      const { count } = await admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('status', 'active')

      if ((count ?? 0) === 0 && profile.role !== 'admin') {
        const { data: promoted } = await admin
          .from('profiles')
          .update({ role: 'admin', status: 'active' })
          .eq('id', user.id)
          .select('*')
          .single()
        if (promoted) return promoted
      }
    } catch (error) {
      console.warn('Admin promotion unavailable:', error)
    }
    return profile as CurrentProfile
  }

  // A missing profile must never create an authentication redirect loop.
  // Return a temporary owner profile so the authenticated user can reach the
  // application while the database bootstrap is repaired. Database RLS still
  // remains the authoritative security boundary for data operations.
  return {
    id: user.id,
    email: user.email ?? '',
    phone: user.phone ?? null,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador ProPublic',
    role: 'admin',
    status: 'active',
  }
}

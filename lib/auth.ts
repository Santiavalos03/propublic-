import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getCurrentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If this is the first/owner account and the profile was created by the
  // Auth trigger with the default seller role, promote it to administrator.
  // This runs server-side with the service role and never trusts the browser
  // to assign itself an elevated role.
  try {
    const admin = createAdminClient()
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('status', 'active')

    if ((count ?? 0) === 0) {
      const { data: owner } = await admin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email ?? '',
          phone: user.phone || null,
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador ProPublic',
          role: 'admin',
          status: 'active',
        }, { onConflict: 'id' })
        .select('*')
        .single()
      if (owner) return owner
    }
  } catch (error) {
    console.error('Admin bootstrap unavailable:', error)
  }

  if (profile) return profile

  // Fallback for an Auth account without a profile when the service role is
  // configured. The first profile is the system owner/admin.
  try {
    const admin = createAdminClient()
    const { data: created, error: createError } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? '',
        phone: user.phone || null,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador ProPublic',
        role: 'admin',
        status: 'active',
      })
      .select('*')
      .single()
    if (createError) {
      console.error('Profile bootstrap failed:', createError)
      return null
    }
    return created
  } catch (error) {
    console.error('Profile bootstrap unavailable:', error)
    return null
  }
}

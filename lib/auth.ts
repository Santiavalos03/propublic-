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

  if (profile) return profile

  // Bootstrap the first Auth account when the database trigger/profile
  // has not been created yet. The first account is the system owner/admin.
  try {
    const admin = createAdminClient()
    const { count, error: countError } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('Profile count failed:', countError)
      return null
    }

    const role = (count ?? 0) === 0 ? 'admin' : 'seller'
    const { data: created, error: createError } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario ProPublic',
        role,
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

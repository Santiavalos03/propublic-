import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (!profile.active) redirect('/login')
  return <DashboardShell>{children}</DashboardShell>
}

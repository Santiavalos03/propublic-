import DashboardShell from '@/components/DashboardShell'

/**
 * ProPublic demo/direct-access mode.
 * Authentication is intentionally bypassed at the UI route level so the
 * dashboard can be opened directly while the production authentication flow
 * is being repaired. Database/RLS policies remain responsible for protected
 * data access.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}

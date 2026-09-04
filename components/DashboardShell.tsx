import Sidebar from './Sidebar'
import { getCurrentProfile } from '@/lib/auth'

export default async function DashboardShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  return (
    <div className="shell">
      <Sidebar role={profile?.role || 'vendedor'} />
      <main className="main">
        <div className="topbar">
          <div>
            <h1>ProPublic</h1>
            <p className="sub">{profile?.full_name} · {profile?.role}</p>
          </div>
          <span className="badge">{profile?.active ? 'Activo' : 'Inactivo'}</span>
        </div>
        {children}
      </main>
    </div>
  )
}

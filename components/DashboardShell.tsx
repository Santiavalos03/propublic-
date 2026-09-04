import Sidebar from './Sidebar'
import {getCurrentProfile} from '@/lib/auth'
export default async function DashboardShell({children}:{children:React.ReactNode}){
 const p=await getCurrentProfile()
 return <div className="shell"><Sidebar role={p?.role||'seller'}/><main className="main"><div className="topbar"><div><h1>ProPublic</h1><p className="sub">{p?.full_name} · {p?.role}</p></div><span className="badge">{p?.status}</span></div>{children}</main></div>
}

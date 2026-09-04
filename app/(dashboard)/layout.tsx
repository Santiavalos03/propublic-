import {redirect} from 'next/navigation'
import {getCurrentProfile} from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'
export default async function Layout({children}:{children:React.ReactNode}){
 const p=await getCurrentProfile(); if(!p) redirect('/login'); if(p.status!=='active') redirect('/login')
 return <DashboardShell>{children}</DashboardShell>
}

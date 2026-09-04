import Link from 'next/link'
import {LayoutDashboard,Users,Package,FileText,ShoppingCart,ClipboardList,Palette,Factory,Wallet,BarChart3,Settings,LogOut} from 'lucide-react'
export default function Sidebar({role}:{role:string}){
 const common=[['Dashboard','/dashboard',LayoutDashboard],['Clientes','/clientes',Users],['Productos','/productos',Package],['Presupuestos','/presupuestos',FileText],['Ventas','/ventas',ShoppingCart],['Pedidos','/pedidos',ClipboardList]]
 const roleLinks=role==='designer'?[['Diseño','/diseno',Palette]]:role==='production'?[['Producción','/produccion',Factory]]:role==='seller'?[['Caja y rendición','/caja',Wallet]]:[['Diseño','/diseno',Palette],['Producción','/produccion',Factory],['Caja y rendición','/caja',Wallet],['Reportes','/reportes',BarChart3],['Configuración','/configuracion',Settings]]
 return <aside className="sidebar"><div className="brand"><img src="/propublic-logo.png" alt="ProPublic"/></div><nav className="nav">{[...common,...roleLinks].map(([t,u,I]:any)=><Link key={u} href={u}><I size={17}/><span>{t}</span></Link>)}<form action="/api/auth/logout" method="post"><button className="btn secondary" style={{width:'100%',marginTop:12}}><LogOut size={16}/> Salir</button></form></nav></aside>
}

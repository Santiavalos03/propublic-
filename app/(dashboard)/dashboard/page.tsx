import {createClient} from '@/lib/supabase/server'
import {money} from '@/lib/money'
export default async function Dashboard(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser()
 const [{data:quotes},{data:sales},{data:orders},{data:payments}]=await Promise.all([
  s.from('quotes').select('id,status,total').eq('seller_id',user!.id),
  s.from('sales').select('id,total').eq('seller_id',user!.id),
  s.from('orders').select('id,status').eq('seller_id',user!.id),
  s.from('payments').select('amount,sale_id,sales!inner(seller_id)').eq('sales.seller_id',user!.id)
 ])
 const q=quotes||[],sa=sales||[],o=orders||[],pa=payments||[]
 return <><div className="grid">
  <div className="card"><div className="label">Ventas</div><div className="metric">{money(sa.reduce((x:any,y:any)=>x+y.total,0))}</div></div>
  <div className="card"><div className="label">Presupuestos pendientes</div><div className="metric">{q.filter((x:any)=>['draft','sent','approval','change_requested'].includes(x.status)).length}</div></div>
  <div className="card"><div className="label">Pedidos activos</div><div className="metric">{o.filter((x:any)=>!['delivered','cancelled'].includes(x.status)).length}</div></div>
  <div className="card"><div className="label">Dinero cobrado</div><div className="metric">{money(pa.reduce((x:any,y:any)=>x+y.amount,0))}</div></div>
 </div><div className="card" style={{marginTop:18}}><h2>Centro operativo</h2><p className="sub">La información se obtiene de PostgreSQL/Supabase y respeta el rol del usuario.</p></div></>
}

import { createClient } from '@/lib/supabase/server'
import { money } from '@/lib/money'

export default async function Dashboard() {
  const s = await createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return null

  // RLS determines which records this user may see. Administrators can see
  // company-wide data; sellers are restricted by database policies.
  const [quotesResult, salesResult, ordersResult, paymentsResult] = await Promise.all([
    s.from('quotes').select('id,status,total'),
    s.from('sales').select('id,total'),
    s.from('orders').select('id,status'),
    s.from('payments').select('amount'),
  ])

  const q = quotesResult.data ?? []
  const sa = salesResult.data ?? []
  const o = ordersResult.data ?? []
  const pa = paymentsResult.data ?? []

  return <>
    <div className="grid">
      <div className="card"><div className="label">Ventas</div><div className="metric">{money(sa.reduce((x: number, y: any) => x + Number(y.total || 0), 0))}</div></div>
      <div className="card"><div className="label">Presupuestos pendientes</div><div className="metric">{q.filter((x: any) => ['draft', 'sent', 'approval', 'change_requested'].includes(x.status)).length}</div></div>
      <div className="card"><div className="label">Pedidos activos</div><div className="metric">{o.filter((x: any) => !['delivered', 'cancelled'].includes(x.status)).length}</div></div>
      <div className="card"><div className="label">Dinero cobrado</div><div className="metric">{money(pa.reduce((x: number, y: any) => x + Number(y.amount || 0), 0))}</div></div>
    </div>
    <div className="card" style={{ marginTop: 18 }}><h2>Centro operativo</h2><p className="sub">Información conectada a PostgreSQL/Supabase.</p></div>
  </>
}

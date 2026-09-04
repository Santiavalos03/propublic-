import {createClient} from '@/lib/supabase/server'
import Link from 'next/link'
export default async function Clientes(){const s=await createClient();const {data}=await s.from('clients').select('*').order('created_at',{ascending:false})
return <><div className="topbar"><div><h1>Clientes</h1><p className="sub">Cartera persistente y con código único.</p></div><Link className="btn" href="/clientes/nuevo">Nuevo cliente</Link></div>
<div className="tablewrap"><table className="table"><thead><tr><th>Código</th><th>Empresa</th><th>RUC/Cédula</th><th>Responsable</th><th>Teléfono</th><th>Vendedor</th></tr></thead><tbody>{(data||[]).map(c=><tr key={c.id}><td><b>{c.code}</b></td><td>{c.company_name||'Sin empresa'}</td><td>{c.tax_id||c.national_id||'—'}</td><td>{c.responsible_first_name} {c.responsible_last_name}</td><td>{c.phone_1||'—'}</td><td>{c.seller_id.slice(0,8)}…</td></tr>)}</tbody></table></div></>}

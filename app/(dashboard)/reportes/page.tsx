import {createClient} from '@/lib/supabase/server'
export default async function Page(){
 const s=await createClient()
 const table='sales'
 const {data}=await s.from(table).select('*').limit(50)
 return <><h1>Reportes</h1><p className="sub">Indicadores comerciales, financieros y operativos.</p><div className="card" style={{marginTop:18}}><p>Registros disponibles: <b>{(data||[]).length}</b></p><p className="sub">Este módulo está conectado a PostgreSQL/Supabase y sujeto a RLS. Las operaciones de creación/edición se implementan mediante rutas API y políticas del esquema.</p></div></>
}

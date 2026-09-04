import {createClient} from '@/lib/supabase/server'
export default async function Page(){
 const s=await createClient()
 const table='production_jobs'
 const {data}=await s.from(table).select('*').limit(50)
 return <><h1>Producción / Taller</h1><p className="sub">Cola de producción, prioridades y control de calidad.</p><div className="card" style={{marginTop:18}}><p>Registros disponibles: <b>{(data||[]).length}</b></p><p className="sub">Este módulo está conectado a PostgreSQL/Supabase y sujeto a RLS. Las operaciones de creación/edición se implementan mediante rutas API y políticas del esquema.</p></div></>
}

'use client'
import {useState} from 'react';import {useRouter} from 'next/navigation'
export default function NuevoCliente(){const r=useRouter();const [f,setF]=useState<any>({});const [error,setError]=useState('')
const fields=[['company_name','Empresa'],['tax_id','RUC'],['national_id','Cédula'],['responsible_first_name','Nombre'],['responsible_last_name','Apellido'],['position','Cargo'],['phone_1','Teléfono 1'],['phone_2','Teléfono 2'],['email_1','Correo 1'],['email_2','Correo 2'],['address','Dirección'],['city','Ciudad'],['notes','Notas']]
async function save(e:any){e.preventDefault();const x=await fetch('/api/clients',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(f)});const j=await x.json();if(!x.ok){setError(j.error);return}r.push('/clientes')}
return <><h1>Nuevo cliente</h1>{error&&<div className="error">{error}</div>}<form className="card" onSubmit={save}><div className="formgrid">{fields.map(([k,l])=><div className="field" key={k}><label>{l}</label><input className="input" value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}</div><button className="btn" style={{marginTop:18}}>Guardar cliente</button></form></>}

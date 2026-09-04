'use client'

import {useState} from 'react'

export default function Login(){
 const [identifier,setIdentifier]=useState('')
 const [password,setPassword]=useState('')
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)

 async function submit(e:React.FormEvent){
  e.preventDefault()
  setBusy(true)
  setError('')

  try {
   const value=identifier.trim()
   const r=await fetch('/api/auth/login',{
    method:'POST',
    headers:{'content-type':'application/json'},
    credentials:'include',
    body:JSON.stringify({identifier:value,password}),
   })
   const j=await r.json().catch(()=>({}))
   if(!r.ok) throw new Error(j.error||'No fue posible iniciar sesión')

   // Do a real browser navigation after the server has issued the
   // Supabase auth cookies. This guarantees the protected server layout
   // receives the same authenticated session and prevents login loops.
   window.location.assign('/dashboard')
  } catch(err) {
   setError(err instanceof Error?err.message:'No fue posible iniciar sesión')
   setBusy(false)
  }
 }

 return <main className="login"><form className="loginbox" onSubmit={submit}>
  <img src="/propublic-logo.png" alt="ProPublic"/><h1>Acceso</h1><p className="sub">ProPublic Sistema Integral</p>
  {error&&<div className="error">{error}</div>}
  <div className="field" style={{marginTop:18}}><label>Correo electrónico o teléfono</label><input className="input" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/></div>
  <div className="field" style={{marginTop:14}}><label>Contraseña</label><input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
  <button className="btn" style={{width:'100%',marginTop:20}} disabled={busy}>{busy?'Ingresando…':'Ingresar'}</button>
 </form></main>
}

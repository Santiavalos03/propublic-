'use client'

import {useState} from 'react'
import { createClient } from '@/lib/supabase/client'

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
   let email=value.toLowerCase()
   const supabase=createClient()

   if(!value.includes('@')){
    const r=await fetch('/api/auth/resolve-phone',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:value})})
    const j=await r.json().catch(()=>({}))
    if(!r.ok || !j.email) throw new Error(j.error||'Usuario no encontrado')
    email=j.email
   }

   const {error:authError}=await supabase.auth.signInWithPassword({email,password})
   if(authError) throw new Error('Correo o contraseña incorrectos')

   const bootstrap=await fetch('/api/auth/bootstrap',{method:'POST',credentials:'include'})
   if(!bootstrap.ok){
    const j=await bootstrap.json().catch(()=>({}))
    throw new Error(j.error||'No se pudo preparar tu cuenta')
   }

   window.location.replace('/dashboard')
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

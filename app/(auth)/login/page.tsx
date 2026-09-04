'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'

export default function Login(){
 const [identifier,setIdentifier]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const router=useRouter()
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('')
  const value=identifier.trim()
  try {
   if(!value.includes('@')){
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identifier:value,password})})
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||'No fue posible iniciar sesión')
   } else {
    const supabase=createClient()
    const {error:authError}=await supabase.auth.signInWithPassword({email:value.toLowerCase(),password})
    if(authError) throw new Error('Credenciales inválidas')
    // Bootstrap the ProPublic profile/admin role. The browser session is
    // already established and persisted independently of this server call.
    await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identifier:value,password})})
   }
   router.replace('/dashboard')
   router.refresh()
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

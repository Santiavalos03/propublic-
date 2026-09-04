'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export default function Login(){
 const [identifier,setIdentifier]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const router=useRouter()
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('')
 const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identifier,password})})
 const j=await r.json(); if(!r.ok){setError(j.error||'No fue posible iniciar sesión');setBusy(false);return}; router.push('/dashboard');router.refresh()}
 return <main className="login"><form className="loginbox" onSubmit={submit}>
  <img src="/propublic-logo.png" alt="ProPublic"/><h1>Acceso</h1><p className="sub">ProPublic Sistema Integral</p>
  {error&&<div className="error">{error}</div>}
  <div className="field" style={{marginTop:18}}><label>Correo electrónico o teléfono</label><input className="input" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/></div>
  <div className="field" style={{marginTop:14}}><label>Contraseña</label><input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
  <button className="btn" style={{width:'100%',marginTop:20}} disabled={busy}>{busy?'Ingresando…':'Ingresar'}</button>
 </form></main>
}

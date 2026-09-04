'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedEmail.includes('@')) throw new Error('Ingresá tu correo electrónico')

      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (authError || !data.session || !data.user) throw new Error('Correo o contraseña incorrectos')

      // Explicitly synchronize the browser session with Next's server cookies.
      // This makes the auth state available to middleware and Server Components
      // even if the browser client cannot persist the SSR cookie by itself.
      const sync = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      })
      if (!sync.ok) {
        const j = await sync.json().catch(() => ({}))
        throw new Error(j.error || 'No se pudo preparar la sesión')
      }

      // Profile creation/promotion is best-effort. A valid authenticated
      // session must never be converted into a login loop because bootstrap
      // is unavailable.
      try {
        await fetch('/api/auth/bootstrap', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
        })
      } catch {}

      window.location.assign('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión')
      setBusy(false)
    }
  }

  return <main className="login"><form className="loginbox" onSubmit={submit}>
    <img src="/propublic-logo.png" alt="ProPublic" />
    <h1>Acceso</h1><p className="sub">ProPublic Sistema Integral</p>
    {error && <div className="error">{error}</div>}
    <div className="field" style={{marginTop:18}}><label>Correo electrónico</label><input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></div>
    <div className="field" style={{marginTop:14}}><label>Contraseña</label><input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" /></div>
    <button className="btn" style={{width:'100%',marginTop:20}} disabled={busy}>{busy?'Ingresando…':'Ingresar'}</button>
  </form></main>
}

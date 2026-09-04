'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const roles = [
  { id: 'administrador', label: 'Administrador', icon: '⚙' },
  { id: 'vendedor', label: 'Vendedor', icon: '▣' },
  { id: 'disenador', label: 'Diseñador', icon: '✦' },
  { id: 'produccion', label: 'Producción', icon: '▤' },
]

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('vendedor')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      const value = identifier.trim()
      if (!value) throw new Error('Ingresá tu correo o teléfono')
      if (!password) throw new Error('Ingresá tu contraseña')

      const supabase = createClient()
      const credentials = value.includes('@')
        ? { email: value.toLowerCase(), password }
        : { phone: value, password }

      const { data, error: authError } = await supabase.auth.signInWithPassword(credentials)
      if (authError || !data.session || !data.user) {
        throw new Error('Correo/teléfono o contraseña incorrectos')
      }

      // El rol seleccionado queda listo para que el perfil/permiso del usuario
      // sea validado en servidor. Nunca confiamos en el rol enviado por el navegador.
      sessionStorage.setItem('propublic_requested_role', role)
      window.location.assign('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión')
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-glow" />
        <img src="/propublic-logo.svg" alt="ProPublic — Industria Publicitaria" />
        <div className="brand-copy">
          <span>GESTIÓN INTEGRAL</span>
          <h2>Todo ProPublic,<br />en un solo lugar.</h2>
          <p>Ventas, clientes, presupuestos, diseño y producción conectados.</p>
        </div>
        <div className="brand-foot">Sistema empresarial · Acceso seguro</div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-logo"><img src="/propublic-logo.svg" alt="ProPublic" /></div>
          <div className="eyebrow">BIENVENIDO</div>
          <h1>Ingresar al sistema</h1>
          <p className="login-description">Accedé con tu cuenta para continuar.</p>

          <div className="field">
            <label htmlFor="identifier">Correo electrónico o teléfono</label>
            <input id="identifier" className="input" value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" placeholder="correo@empresa.com" />
          </div>

          <div className="field password-field">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrap">
              <input id="password" type={showPassword ? 'text' : 'password'} className="input" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? 'Ocultar' : 'Ver'}</button>
            </div>
          </div>

          <div className="field role-field">
            <label>Perfil de acceso</label>
            <div className="role-grid">
              {roles.map(item => (
                <button type="button" key={item.id} className={`role-option ${role === item.id ? 'selected' : ''}`} onClick={() => setRole(item.id)}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error" role="alert">{error}</div>}

          <button className="btn login-submit" disabled={busy}>{busy ? 'Verificando acceso…' : 'Ingresar a ProPublic'}</button>
          <p className="security-note">🔒 Tu sesión está protegida. Los permisos se validan en el servidor.</p>
        </form>
      </section>
    </main>
  )
}

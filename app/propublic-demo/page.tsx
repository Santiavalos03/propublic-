'use client'

import { useMemo, useState } from 'react'

const modules = [
  ['Clientes', 'CRM', 'Gestiona empresas, contactos, RUC y descuentos.'],
  ['Productos', 'Catálogo', 'Artículos, fotos, medidas y precios con IVA.'],
  ['Presupuestos', 'Ventas', 'Crea presupuestos, descuentos, PDF y QR.'],
  ['Ventas', 'Comercial', 'Ventas, pagos, saldos y estados.'],
  ['Pedidos', 'Operaciones', 'Coordina diseño, producción y entregas.'],
  ['Caja', 'Finanzas', 'Movimientos, arqueos y rendición por vendedor.'],
]

export default function ProPublicDemo() {
  const [active, setActive] = useState('Resumen')
  const [query, setQuery] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [logged, setLogged] = useState(false)

  const filtered = useMemo(() => modules.filter(([name, area, desc]) =>
    `${name} ${area} ${desc}`.toLowerCase().includes(query.toLowerCase())
  ), [query])

  if (showLogin && !logged) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8"><div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-800"/><div><b className="text-2xl text-indigo-900">Pro<span className="text-fuchsia-600">Public</span></b><p className="text-xs text-slate-500">Industria Publicitaria</p></div></div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso al sistema</h1>
        <p className="mt-2 text-slate-500">Ingresá con tu cuenta de ProPublic.</p>
        <label className="block mt-7 text-sm font-semibold">Correo o teléfono<input className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-fuchsia-500" placeholder="usuario@propublic.com" /></label>
        <label className="block mt-4 text-sm font-semibold">Contraseña<input type="password" className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-fuchsia-500" placeholder="••••••••" /></label>
        <select className="mt-4 w-full rounded-xl border p-3"><option>Administrador</option><option>Vendedor</option><option>Diseñador</option><option>Producción</option></select>
        <button onClick={() => setLogged(true)} className="mt-6 w-full rounded-xl bg-indigo-800 py-3 font-bold text-white hover:bg-indigo-900">Ingresar</button>
        <button onClick={() => setShowLogin(false)} className="mt-3 w-full py-2 text-sm text-slate-500">Volver</button>
      </section>
    </main>
  )

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4">
      <div className="flex items-center gap-3 mr-auto"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-800"/><div><b className="text-xl text-indigo-900">Pro<span className="text-fuchsia-600">Public</span></b><p className="text-[10px] text-slate-500">Industria Publicitaria</p></div></div>
      <input value={query} onChange={e=>setQuery(e.target.value)} className="hidden md:block w-80 rounded-xl border bg-slate-50 px-4 py-2.5" placeholder="Buscar clientes, productos, presupuestos..." />
      <button onClick={() => {setShowLogin(true);setLogged(false)}} className="rounded-xl border px-4 py-2 text-sm font-semibold">Acceso</button>
    </div></header>
    <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
      <aside className="border-r bg-white p-4 min-h-[calc(100vh-73px)] hidden md:block"><p className="px-3 py-2 text-xs font-bold uppercase text-slate-400">Principal</p>{['Resumen','Clientes','Productos','Presupuestos','Ventas','Pedidos','Caja'].map(x=><button key={x} onClick={()=>setActive(x)} className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold ${active===x?'bg-indigo-50 text-indigo-800':'text-slate-600 hover:bg-slate-50'}`}>{x}</button>)}<p className="px-3 pt-7 pb-2 text-xs font-bold uppercase text-slate-400">Producción</p>{['Diseño','Producción','Reportes'].map(x=><button key={x} onClick={()=>setActive(x)} className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold ${active===x?'bg-fuchsia-50 text-fuchsia-700':'text-slate-600 hover:bg-slate-50'}`}>{x}</button>)}</aside>
      <section className="p-5 md:p-8"><div className="mb-8"><p className="text-sm font-semibold text-fuchsia-600">Panel de control</p><h1 className="text-3xl font-black mt-1">{active}</h1><p className="text-slate-500 mt-1">Sistema integral de gestión ProPublic.</p></div>
        {active==='Resumen' ? <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Ventas del mes','$ 0'],['Presupuestos','0'],['Pedidos en proceso','0'],['Saldo pendiente','$ 0']].map(([a,b])=><div key={a} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{a}</p><strong className="mt-2 block text-2xl">{b}</strong></div>)}</div><div className="mt-7 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-6"><h2 className="font-bold text-lg">Módulos del sistema</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{filtered.map(([name,area,desc])=><button onClick={()=>setActive(name)} key={name} className="rounded-xl border p-4 text-left hover:border-indigo-300 hover:bg-indigo-50"><span className="text-xs font-bold uppercase text-fuchsia-600">{area}</span><h3 className="font-bold mt-1">{name}</h3><p className="text-sm text-slate-500 mt-1">{desc}</p></button>)}</div></div><div className="rounded-2xl border bg-white p-6"><h2 className="font-bold text-lg">Actividad reciente</h2><div className="mt-4 space-y-3 text-sm text-slate-500"><p className="rounded-xl bg-slate-50 p-3">No hay operaciones todavía.</p><p className="rounded-xl bg-slate-50 p-3">Los movimientos reales aparecerán aquí al conectar Supabase.</p></div></div></div></> : <div className="rounded-2xl border bg-white p-8"><h2 className="text-xl font-bold">{active}</h2><p className="mt-2 text-slate-500">Módulo preparado para conectarse a los datos reales de ProPublic.</p><button className="mt-6 rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white">Crear nuevo</button></div>}
      </section>
    </div>
  </main>
}

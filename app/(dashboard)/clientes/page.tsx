import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Clientes() {
  const supabase = await createClient()
  const { data: clients, error } = await supabase
    .from('customers')
    .select('id, code, company_name, tax_id, first_name, last_name, representative_name, phone_1, seller_id, created_at')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Clientes</h1>
          <p className="sub">Cartera persistente y con código único.</p>
        </div>
        <Link className="btn" href="/clientes/nuevo">Nuevo cliente</Link>
      </div>

      {error ? (
        <div className="card" role="alert">No se pudieron cargar los clientes. Revisa la conexión con Supabase.</div>
      ) : (
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Código</th><th>Empresa</th><th>RUC/Cédula</th><th>Responsable</th><th>Teléfono</th><th>Vendedor</th></tr></thead>
            <tbody>
              {(clients ?? []).map((client) => (
                <tr key={client.id}>
                  <td><b>{client.code}</b></td>
                  <td>{client.company_name || 'Sin empresa'}</td>
                  <td>{client.tax_id || '—'}</td>
                  <td>{client.representative_name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || '—'}</td>
                  <td>{client.phone_1 || '—'}</td>
                  <td>{client.seller_id ? `${client.seller_id.slice(0, 8)}…` : '—'}</td>
                </tr>
              ))}
              {!clients?.length && <tr><td colSpan={6}>Todavía no hay clientes registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

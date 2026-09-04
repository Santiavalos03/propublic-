import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPrefixes = [
  '/dashboard', '/clientes', '/productos', '/presupuestos', '/ventas', '/pagos',
  '/pedidos', '/diseno', '/produccion', '/caja', '/reportes', '/configuracion',
]

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Do NOT redirect an authenticated user away from /login here.
  // If the user's ProPublic profile is missing/inactive, the dashboard
  // may redirect back to /login; redirecting /login back to /dashboard
  // would create an infinite Safari redirect loop.
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/clientes/:path*', '/productos/:path*', '/presupuestos/:path*',
    '/ventas/:path*', '/pagos/:path*', '/pedidos/:path*', '/diseno/:path*',
    '/produccion/:path*', '/caja/:path*', '/reportes/:path*', '/configuracion/:path*', '/login',
  ],
}

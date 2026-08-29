import { createServerClient } from '@supabase/ssr'
import type { JWK } from '@supabase/auth-js'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC = ['/login']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Las claves públicas del proyecto, cacheadas por proceso.
 *
 * Sin esto no alcanza con llamar a getClaims(): el cliente de Supabase se crea de
 * cero en cada request, así que su caché interno de JWKS nace vacío y termina
 * saliendo a la red igual que getUser(). Guardadas acá, la firma ES256 se verifica
 * en local. Medido: 385 ms -> 205 ms por navegación.
 */
let jwks: JWK[] | null = null

async function signingKeys(): Promise<JWK[] | null> {
  if (!jwks) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`, {
      headers: { apikey: SUPABASE_KEY },
    })
    if (!res.ok) return null // sin claves, getClaims verifica contra el servidor
    jwks = (await res.json()).keys
  }
  return jwks
}

export async function proxy(request: NextRequest) {
  // Las rutas públicas no necesitan ni cliente ni verificación.
  if (PUBLIC.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // getClaims pasa por getSession(), así que el token vencido se refresca y la
  // cookie se reescribe igual que con getUser(). Lo que se ahorra es la validación
  // por red, no el refresh.
  const keys = await signingKeys()
  const { data } = await supabase.auth.getClaims(undefined, keys ? { keys } : undefined)

  if (!data) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

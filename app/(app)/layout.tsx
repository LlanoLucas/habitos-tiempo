import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Este layout no consulta al usuario a propósito: proxy.ts ya garantiza que sin
 * sesión no se llega acá. Un getUser() de cortesía costaba ~180 ms de red en cada
 * navegación, solo para decidir si dibujar el nav.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <>
      {children}
      <nav>
        <Link href="/">Día</Link>
        <Link href="/habits">Hábitos</Link>
        <Link href="/budget">Presupuesto</Link>
        <Link href="/analytics">Análisis</Link>
        <form action={signOut}>
          <button type="submit">Salir</button>
        </form>
      </nav>
    </>
  )
}

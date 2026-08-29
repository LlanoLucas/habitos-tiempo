import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hábitos + Tiempo',
  description: 'Seguimiento de hábitos y presupuesto de tiempo',
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <html lang="es">
      <body>
        {user && (
          <nav>
            <Link href="/">Día</Link><Link href="/habits">Hábitos</Link>
            <Link href="/budget">Presupuesto</Link><Link href="/analytics">Análisis</Link>
            <form action={signOut}>
              <button type="submit">Salir</button>
            </form>
          </nav>
        )}
        {children}
      </body>
    </html>
  )
}

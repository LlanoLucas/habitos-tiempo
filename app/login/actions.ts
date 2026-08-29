'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string }

const MIN_PASSWORD = 8

export async function authenticate(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const signup = formData.get('intent') === 'signup'

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Ese mail no parece válido.' }
  if (password.length < MIN_PASSWORD) {
    return { error: `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.` }
  }

  const supabase = await createClient()
  const { data, error } = signup
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  // Si el proyecto todavía pide confirmar el mail, signUp devuelve usuario pero no sesión.
  if (!data.session) {
    return { error: 'Cuenta creada, pero falta confirmar el mail. Apagá "Confirm email" en Supabase.' }
  }

  redirect('/')
}

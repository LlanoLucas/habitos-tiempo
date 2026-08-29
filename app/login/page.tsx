'use client'

import { useActionState } from 'react'
import { authenticate, type AuthState } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(authenticate, {})

  return (
    <main>
      <h1>Hábitos + Tiempo</h1>

      <form action={action}>
        <label>
          Mail
          <input name="email" type="email" inputMode="email" autoComplete="email" required />
        </label>

        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>

        {/* El name/value del botón apretado viaja en el FormData: un form, dos acciones. */}
        <button type="submit" name="intent" value="signin" disabled={pending}>
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="submit" name="intent" value="signup" disabled={pending}>
          Crear cuenta
        </button>

        {state.error && <p role="alert">{state.error}</p>}
      </form>
    </main>
  )
}

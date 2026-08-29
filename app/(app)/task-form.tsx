'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addTask, type ActionState } from './actions'

export default function TaskForm({ day }: { day: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTask, {})
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) ref.current?.reset()
  }, [state])

  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="day" value={day} />

      <label>
        Nueva tarea
        <input name="title" required maxLength={200} placeholder="Llamar al dentista" />
      </label>

      <fieldset>
        <legend>Tipo</legend>
        <label>
          <input type="checkbox" name="is_reminder" /> Es un recordatorio importante
        </label>
      </fieldset>

      <button type="submit" disabled={pending}>
        {pending ? 'Agregando...' : 'Agregar'}
      </button>

      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}

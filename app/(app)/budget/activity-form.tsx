'use client'

import { useActionState, useEffect, useRef } from 'react'
import { saveActivity, type ActionState } from './actions'
import type { Activity } from '@/lib/database.types'

export default function ActivityForm({ activity }: { activity?: Activity }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveActivity, {})
  const ref = useRef<HTMLFormElement>(null)

  // Solo el form de alta se vacía; el de edición conserva lo que quedó guardado.
  useEffect(() => {
    if (state.ok && !activity) ref.current?.reset()
  }, [state, activity])

  return (
    <form ref={ref} action={action}>
      {activity && <input type="hidden" name="id" value={activity.id} />}

      <label>
        Actividad
        <input name="name" required maxLength={80} defaultValue={activity?.name} placeholder="Celular" />
      </label>

      <label>
        Minutos por día
        <input
          name="budget_minutes"
          type="number"
          inputMode="numeric"
          min={0}
          max={1440}
          step={1}
          required
          defaultValue={activity?.budget_minutes}
          placeholder="120"
        />
      </label>

      <fieldset>
        <legend>Tipo</legend>
        <label>
          <input type="radio" name="kind" value="grow" defaultChecked={activity?.kind !== 'cut'} /> Fomentar (quiero llegar)
        </label>
        <label>
          <input type="radio" name="kind" value="cut" defaultChecked={activity?.kind === 'cut'} /> Recortar (no quiero pasarme)
        </label>
      </fieldset>

      <button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : activity ? 'Guardar cambios' : 'Agregar actividad'}
      </button>

      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}

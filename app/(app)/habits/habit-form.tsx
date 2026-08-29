'use client'

import { useActionState, useEffect, useRef } from 'react'
import { saveHabit, type ActionState } from './actions'
import { WEEKDAYS } from '@/lib/habits'
import type { Habit } from '@/lib/database.types'

export default function HabitForm({ habit }: { habit?: Habit }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHabit, {})
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok && !habit) ref.current?.reset()
  }, [state, habit])

  return (
    <form ref={ref} action={action}>
      {habit && <input type="hidden" name="id" value={habit.id} />}

      <label>
        Hábito
        <input name="name" required maxLength={80} defaultValue={habit?.name} placeholder="Leer" />
      </label>

      <label>
        Veces por día
        <input
          name="times_per_day"
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          step={1}
          required
          defaultValue={habit?.times_per_day ?? 1}
        />
      </label>

      <fieldset>
        <legend>Días (ninguno = todos)</legend>
        {WEEKDAYS.map((d) => (
          <label key={d.value}>
            <input
              type="checkbox"
              name="weekdays"
              value={d.value}
              defaultChecked={habit?.weekdays?.includes(d.value) ?? false}
            />
            {d.label}
          </label>
        ))}
      </fieldset>

      <label>
        Meta semanal (opcional, si no se calcula sola)
        <input
          name="times_per_week"
          type="number"
          inputMode="numeric"
          min={1}
          max={350}
          step={1}
          defaultValue={habit?.times_per_week ?? ''}
        />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : habit ? 'Guardar cambios' : 'Agregar hábito'}
      </button>

      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}

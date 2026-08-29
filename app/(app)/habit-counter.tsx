'use client'

import { useOptimistic } from 'react'
import { logHabit } from './actions'

/**
 * El contador se mueve al toque y el viaje al servidor va atrás. Si falla,
 * React revierte al valor real cuando llega la respuesta.
 */
export default function HabitCounter({
  habitId,
  day,
  count,
  goal,
}: {
  habitId: string
  day: string
  count: number
  goal: number
}) {
  const [shown, setShown] = useOptimistic(count)

  return (
    <>
      <p>
        {shown} de {goal} {shown >= goal ? '✓' : ''}
      </p>
      <form
        className="row"
        action={async (formData) => {
          setShown(Number(formData.get('next')))
          await logHabit(formData)
        }}
      >
        <input type="hidden" name="habit_id" value={habitId} />
        <input type="hidden" name="day" value={day} />
        {/* El value del botón apretado viaja en el FormData: un form, dos pasos. */}
        <button type="submit" name="next" value={shown - 1} disabled={shown === 0} aria-label="Restar">
          −
        </button>
        <button type="submit" name="next" value={shown + 1} aria-label="Sumar">
          +
        </button>
      </form>
    </>
  )
}

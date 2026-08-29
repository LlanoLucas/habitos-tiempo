'use client'

import { useActionState } from 'react'
import { logTime, type ActionState } from './actions'

export default function TimeLogForm({
  activityId,
  day,
  minutes,
}: {
  activityId: string
  day: string
  minutes: number
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(logTime, {})

  return (
    <form action={action} className="row">
      <input type="hidden" name="activity_id" value={activityId} />
      <input type="hidden" name="day" value={day} />
      <input
        name="minutes"
        type="number"
        inputMode="numeric"
        min={0}
        max={1440}
        step={1}
        required
        defaultValue={minutes}
        aria-label="Minutos reales"
      />
      <button type="submit" disabled={pending}>
        {pending ? '...' : 'OK'}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}

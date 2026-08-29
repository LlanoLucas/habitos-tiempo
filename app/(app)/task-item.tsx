'use client'

import { useOptimistic } from 'react'
import { deleteTask, toggleTask } from './actions'
import type { Task } from '@/lib/database.types'

export default function TaskItem({ task }: { task: Task }) {
  const [done, setDone] = useOptimistic(task.done)
  const [gone, setGone] = useOptimistic(false)

  if (gone) return null

  return (
    <li className="row">
      <form
        action={async (formData) => {
          setDone(!done)
          await toggleTask(formData)
        }}
      >
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="done" value={String(done)} />
        <button type="submit" aria-label={done ? 'Marcar pendiente' : 'Marcar hecha'}>
          {done ? '✓' : '○'}
        </button>
      </form>

      <span className={done ? 'done' : undefined}>{task.title}</span>

      <form
        action={async (formData) => {
          setGone(true)
          await deleteTask(formData)
        }}
      >
        <input type="hidden" name="id" value={task.id} />
        <button type="submit" aria-label="Borrar">
          ✕
        </button>
      </form>
    </li>
  )
}

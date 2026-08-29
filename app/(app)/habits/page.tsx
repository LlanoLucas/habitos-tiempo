import { createClient } from '@/lib/supabase/server'
import { describeDays, weeklyGoal } from '@/lib/habits'
import type { Habit } from '@/lib/database.types'
import HabitForm from './habit-form'
import { deleteHabit } from './actions'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('archived', false)
    .order('name')

  if (error) return <main><p role="alert">No se pudieron cargar los hábitos: {error.message}</p></main>

  const habits = data ?? []

  return (
    <main>
      <h1>Hábitos</h1>

      <section>
        <h2>Nuevo hábito</h2>
        <HabitForm />
      </section>

      <section>
        <h2>Tus hábitos ({habits.length})</h2>
        {habits.length === 0 && <p>Todavía no cargaste ninguno.</p>}
        <ul>
          {habits.map((h) => (
            <HabitItem key={h.id} habit={h} />
          ))}
        </ul>
      </section>
    </main>
  )
}

function HabitItem({ habit }: { habit: Habit }) {
  return (
    <li>
      <h3>{habit.name}</h3>
      <dl>
        <dt>Días</dt>
        <dd>{describeDays(habit.weekdays)}</dd>
        <dt>Por día</dt>
        <dd>{habit.times_per_day}×</dd>
        <dt>Meta semanal</dt>
        <dd>
          {weeklyGoal(habit)}×{habit.times_per_week === null ? '' : ' (fijada)'}
        </dd>
      </dl>

      <details>
        <summary>Editar</summary>
        <HabitForm habit={habit} />
      </details>

      <form action={deleteHabit}>
        <input type="hidden" name="id" value={habit.id} />
        <button type="submit">Borrar</button>
      </form>
    </li>
  )
}

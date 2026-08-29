import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDay, formatMinutes, shiftDay, todayISO } from '@/lib/time'
import { isDue } from '@/lib/habits'
import type { Activity, Habit, Task } from '@/lib/database.types'
import TaskForm from './task-form'
import TaskItem from './task-item'
import TimeLogForm from './time-log-form'
import TodayGuard from './today-guard'
import HabitCounter from './habit-counter'

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export default async function PlannerPage({ searchParams }: PageProps<'/'>) {
  const params = await searchParams
  const requested = typeof params.d === 'string' && ISO_DAY.test(params.d) ? params.d : null
  const day = requested ?? todayISO()

  const supabase = await createClient()
  const [tasks, habits, habitLogs, activities, timeLogs] = await Promise.all([
    supabase.from('tasks').select('*').eq('day', day).order('sort_order').order('created_at'),
    supabase.from('habits').select('*').eq('archived', false).order('name'),
    supabase.from('habit_logs').select('*').eq('day', day),
    supabase.from('activities').select('*').eq('archived', false).order('name'),
    supabase.from('time_logs').select('*').eq('day', day),
  ])

  const failure = [tasks, habits, habitLogs, activities, timeLogs].find((r) => r.error)
  if (failure) return <main><p role="alert">No se pudo cargar el día: {failure.error!.message}</p></main>

  const counts = new Map((habitLogs.data ?? []).map((l) => [l.habit_id, l.count]))
  const logged = new Map((timeLogs.data ?? []).map((l) => [l.activity_id, l.minutes]))
  const dueToday = (habits.data ?? []).filter((h) => isDue(h, day))
  const reminders = (tasks.data ?? []).filter((t) => t.is_reminder)
  const todos = (tasks.data ?? []).filter((t) => !t.is_reminder)

  return (
    <main>
      {!requested && <TodayGuard serverDay={day} />}

      <div className="day-nav">
        <Link href={`/?d=${shiftDay(day, -1)}`}>‹ Ayer</Link>
        <h1>{day === todayISO() ? 'Hoy' : formatDay(day)}</h1>
        <Link href={`/?d=${shiftDay(day, 1)}`}>Mañana ›</Link>
      </div>
      <form method="get" className="row">
        <input type="date" name="d" defaultValue={day} aria-label="Ir a una fecha" />
        <button type="submit">Ir</button>
      </form>

      <section>
        <h2>Agregar</h2>
        <TaskForm day={day} />
      </section>

      {reminders.length > 0 && (
        <section>
          <h2>Recordatorios importantes</h2>
          <ul>
            {reminders.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Tareas ({todos.filter((t) => !t.done).length} pendientes)</h2>
        {todos.length === 0 && <p>Nada anotado para este día.</p>}
        <ul>
          {todos.map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
        </ul>
      </section>

      <section>
        <h2>Hábitos de hoy</h2>
        {dueToday.length === 0 && (
          <p>
            Ninguno toca este día. <Link href="/habits">Crear hábitos</Link>
          </p>
        )}
        <ul>
          {dueToday.map((h) => (
            <HabitRow key={h.id} habit={h} day={day} count={counts.get(h.id) ?? 0} />
          ))}
        </ul>
      </section>

      <section>
        <h2>Tiempo del día</h2>
        {(activities.data ?? []).length === 0 && (
          <p>
            No hay actividades presupuestadas. <Link href="/budget">Cargar presupuesto</Link>
          </p>
        )}
        <ul>
          {(activities.data ?? []).map((a) => (
            <TimeRow key={a.id} activity={a} day={day} minutes={logged.get(a.id) ?? 0} />
          ))}
        </ul>
      </section>
    </main>
  )
}

function HabitRow({ habit, day, count }: { habit: Habit; day: string; count: number }) {
  return (
    <li className="row">
      <div>
        <h3>{habit.name}</h3>
      </div>
      <HabitCounter habitId={habit.id} day={day} count={count} goal={habit.times_per_day} />
    </li>
  )
}

function TimeRow({ activity, day, minutes }: { activity: Activity; day: string; minutes: number }) {
  const over = activity.kind === 'cut' && minutes > activity.budget_minutes
  const reached = activity.kind === 'grow' && minutes >= activity.budget_minutes

  return (
    <li className="row">
      <div>
        <h3>{activity.name}</h3>
        <p>
          {activity.kind === 'cut' ? 'Límite' : 'Meta'} {formatMinutes(activity.budget_minutes)}
          {over ? ' · te pasaste' : reached ? ' · ✓' : ''}
        </p>
      </div>
      <TimeLogForm activityId={activity.id} day={day} minutes={minutes} />
    </li>
  )
}

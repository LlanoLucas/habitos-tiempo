import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatHours, formatMinutes, todayISO } from '@/lib/time'
import { balance, formatDiff, formatPercent, habitProgress, rangeDays } from '@/lib/analytics'
import type { Activity, Habit } from '@/lib/database.types'

const WINDOWS = [7, 30, 90] as const

export default async function AnalyticsPage({ searchParams }: PageProps<'/analytics'>) {
  const params = await searchParams
  const asked = Number(params.days)
  const window = (WINDOWS as readonly number[]).includes(asked) ? asked : 7

  const end = todayISO()
  const days = rangeDays(end, window)
  const start = days[0]

  const supabase = await createClient()
  const [activities, timeLogs, habits, habitLogs] = await Promise.all([
    supabase.from('activities').select('*').eq('archived', false).order('name'),
    supabase.from('time_logs').select('activity_id,minutes').gte('day', start).lte('day', end),
    supabase.from('habits').select('*').eq('archived', false).order('name'),
    supabase.from('habit_logs').select('habit_id,count').gte('day', start).lte('day', end),
  ])

  const failure = [activities, timeLogs, habits, habitLogs].find((r) => r.error)
  if (failure) return <main><p role="alert">No se pudo cargar el balance: {failure.error!.message}</p></main>

  const spent = sumBy(timeLogs.data ?? [], 'activity_id', 'minutes')
  const reps = sumBy(habitLogs.data ?? [], 'habit_id', 'count')

  const rows = (activities.data ?? []).map((a) => ({
    activity: a,
    b: balance(a, spent.get(a.id) ?? 0, window),
  }))
  const totalBudget = rows.reduce((s, r) => s + r.b.budgeted, 0)
  const totalActual = rows.reduce((s, r) => s + r.b.actual, 0)

  return (
    <main>
      <h1>Balance</h1>

      <nav className="row">
        {WINDOWS.map((w) => (
          <Link key={w} href={`/analytics?days=${w}`} aria-current={w === window ? 'page' : undefined}>
            {w} días
          </Link>
        ))}
      </nav>

      <section>
        <h2>Últimos {window} días</h2>
        <dl>
          <dt>Presupuestado</dt>
          <dd>{formatHours(totalBudget)}</dd>
          <dt>Real</dt>
          <dd>{formatHours(totalActual)}</dd>
          <dt>Diferencia</dt>
          <dd>{formatDiff(totalActual - totalBudget)}</dd>
        </dl>
      </section>

      <section>
        <h2>Tiempo por actividad</h2>
        {rows.length === 0 && (
          <p>
            No hay actividades cargadas. <Link href="/budget">Ir al presupuesto</Link>
          </p>
        )}
        <ul>
          {rows.map(({ activity, b }) => (
            <ActivityBalance key={activity.id} activity={activity} b={b} window={window} />
          ))}
        </ul>
      </section>

      <section>
        <h2>Hábitos</h2>
        {(habits.data ?? []).length === 0 && (
          <p>
            No hay hábitos cargados. <Link href="/habits">Crear hábitos</Link>
          </p>
        )}
        <ul>
          {(habits.data ?? []).map((h) => (
            <HabitBalance key={h.id} habit={h} days={days} done={reps.get(h.id) ?? 0} />
          ))}
        </ul>
      </section>
    </main>
  )
}

function ActivityBalance({
  activity,
  b,
  window,
}: {
  activity: Activity
  b: ReturnType<typeof balance>
  window: number
}) {
  return (
    <li>
      <h3>
        {activity.name} {b.onTrack ? '✓' : '⚠'}
      </h3>
      <p>
        {activity.kind === 'cut' ? 'A recortar' : 'A fomentar'} ·{' '}
        {formatMinutes(activity.budget_minutes)} por día
      </p>
      <dl>
        <dt>Presupuesto</dt>
        <dd>{formatHours(b.budgeted)}</dd>
        <dt>Real</dt>
        <dd>{formatHours(b.actual)}</dd>
        <dt>Balance</dt>
        <dd>{formatDiff(b.diff)}</dd>
      </dl>
      <progress value={Math.min(b.actual, b.budgeted * 2)} max={b.budgeted * 2 || 1} />
      <p>
        A este ritmo ({formatMinutes(b.dailyAvg)} por día): <strong>{formatHours(b.yearlyAtThisRate)}</strong> al año,
        contra {formatHours(activity.budget_minutes * 365)} presupuestadas.
      </p>
      <p>Medido sobre {window} días.</p>
    </li>
  )
}

function HabitBalance({ habit, days, done }: { habit: Habit; days: string[]; done: number }) {
  const p = habitProgress(habit, days, done)

  return (
    <li>
      <h3>
        {habit.name} {p.ratio >= 1 ? '✓' : ''}
      </h3>
      <p>
        {p.done} de {Math.round(p.expected)} · {formatPercent(p.ratio)}
      </p>
      <progress value={p.done} max={Math.max(p.expected, 1)} />
    </li>
  )
}

/** Agrupa y suma una columna por clave. */
function sumBy<K extends string, V extends string, T extends Record<K, string> & Record<V, number>>(
  rows: T[],
  key: K,
  value: V
): Map<string, number> {
  const out = new Map<string, number>()
  for (const row of rows) out.set(row[key], (out.get(row[key]) ?? 0) + row[value])
  return out
}

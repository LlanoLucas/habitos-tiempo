import { project, shiftDay } from './time.ts'
import { isDue } from './habits.ts'
import type { Activity, Habit } from '@/lib/database.types'

/** Los `count` días que terminan en `end`, incluido. */
export function rangeDays(end: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftDay(end, -(count - 1 - i)))
}

export type Balance = {
  budgeted: number
  actual: number
  diff: number
  onTrack: boolean
  dailyAvg: number
  yearlyAtThisRate: number
}

/**
 * Balance de una actividad en el rango. El criterio se da vuelta según el tipo:
 * en 'cut' cumplís si NO te pasaste, en 'grow' si llegaste.
 */
export function balance(activity: Pick<Activity, 'kind' | 'budget_minutes'>, actual: number, days: number): Balance {
  const budgeted = activity.budget_minutes * days
  const dailyAvg = days > 0 ? actual / days : 0

  return {
    budgeted,
    actual,
    diff: actual - budgeted,
    onTrack: activity.kind === 'cut' ? actual <= budgeted : actual >= budgeted,
    dailyAvg,
    yearlyAtThisRate: project(dailyAvg, 'year'),
  }
}

export type HabitProgress = { expected: number; done: number; ratio: number }

/**
 * Cuánto hiciste contra cuánto tocaba en el rango.
 * Con meta semanal fijada se prorratea por semana; si no, se cuentan los días que tocaban.
 */
export function habitProgress(
  habit: Pick<Habit, 'weekdays' | 'times_per_day' | 'times_per_week'>,
  days: string[],
  done: number
): HabitProgress {
  const expected =
    habit.times_per_week !== null
      ? (habit.times_per_week * days.length) / 7
      : days.filter((d) => isDue(habit, d)).length * habit.times_per_day

  return { expected, done, ratio: expected > 0 ? done / expected : 0 }
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

/** "+2 h 30 min" / "−45 min" — el signo es la mitad del dato en un balance. */
export function formatDiff(minutes: number): string {
  const total = Math.round(Math.abs(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  const size = h ? `${h} h ${m} min` : `${m} min`
  return `${minutes < 0 ? '−' : '+'}${size}`
}

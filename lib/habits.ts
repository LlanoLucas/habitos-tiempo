import type { Habit } from '@/lib/database.types'

/** ISO: 1 = lunes ... 7 = domingo, igual que Date.getDay() corrido. */
export const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
] as const

type GoalInput = Pick<Habit, 'weekdays' | 'times_per_day' | 'times_per_week'>

/**
 * Meta semanal: la explícita si la cargaste; si no, la derivada de
 * (días marcados, o los 7 si no marcaste ninguno) × veces por día.
 */
export function weeklyGoal(habit: GoalInput): number {
  // ?? afuera: una meta explícita de 0 tiene que sobrevivir.
  // || adentro: sin días marcados (null o []) la meta es todos los días.
  return habit.times_per_week ?? (habit.weekdays?.length || 7) * habit.times_per_day
}

export function describeDays(weekdays: number[] | null): string {
  if (!weekdays || weekdays.length === 0) return 'Todos los días'
  if (weekdays.length === 7) return 'Todos los días'
  return WEEKDAYS.filter((d) => weekdays.includes(d.value))
    .map((d) => d.label)
    .join(' · ')
}

/** Día de la semana ISO (1 = lunes ... 7 = domingo) de un YYYY-MM-DD. */
export function isoWeekday(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  const js = new Date(y, m - 1, d).getDay() // 0 = domingo
  return js === 0 ? 7 : js
}

/** Sin días marcados, el hábito toca todos los días. */
export function isDue(habit: Pick<Habit, 'weekdays'>, day: string): boolean {
  return !habit.weekdays?.length || habit.weekdays.includes(isoWeekday(day))
}

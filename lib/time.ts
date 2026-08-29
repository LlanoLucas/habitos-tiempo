// Extrapolación de tiempo diario a semana / mes / año.
// El mes es un doceavo del año para que las tres proyecciones no se contradigan entre sí.
export const DAYS = { day: 1, week: 7, month: 365 / 12, year: 365 } as const

export type Period = keyof typeof DAYS

export function project(minutesPerDay: number, period: Period): number {
  return minutesPerDay * DAYS[period]
}

export function projectAll(minutesPerDay: number) {
  return {
    day: minutesPerDay,
    week: project(minutesPerDay, 'week'),
    month: project(minutesPerDay, 'month'),
    year: project(minutesPerDay, 'year'),
  }
}

/** "730 h" para totales grandes, "12,5 h" para chicos. */
export function formatHours(minutes: number): string {
  const h = minutes / 60
  return h >= 100 ? `${Math.round(h)} h` : `${h.toFixed(1).replace('.', ',')} h`
}

/** "2 h 30 min" — para cifras diarias, donde los minutos importan. */
export function formatMinutes(minutes: number): string {
  const total = Math.round(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? `${h} h ${m} min` : `${m} min`
}

export const MINUTES_PER_DAY = 24 * 60

/**
 * Fecha local en YYYY-MM-DD. No usar toISOString(): convierte a UTC y en GMT-3
 * a partir de las 21:00 devuelve el día siguiente.
 */
export function todayISO(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Corre una fecha YYYY-MM-DD N días. Date normaliza el desborde de mes y año. */
export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return todayISO(new Date(y, m - 1, d + delta))
}

/** "vie 29 ago" — para el encabezado del día. */
export function formatDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

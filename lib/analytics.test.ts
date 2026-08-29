import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rangeDays, balance, habitProgress, formatDiff, formatPercent } from './analytics.ts'

test('rangeDays termina en el día pedido y cuenta hacia atrás', () => {
  assert.deepEqual(rangeDays('2026-08-29', 3), ['2026-08-27', '2026-08-28', '2026-08-29'])
  assert.deepEqual(rangeDays('2026-03-01', 2), ['2026-02-28', '2026-03-01'])
  assert.equal(rangeDays('2026-08-29', 30).length, 30)
})

test('cut: cumplís mientras no te pases', () => {
  const cut = { kind: 'cut' as const, budget_minutes: 120 }
  assert.equal(balance(cut, 700, 7).onTrack, true)   // 700 < 840 presupuestados
  assert.equal(balance(cut, 900, 7).onTrack, false)
  assert.equal(balance(cut, 840, 7).onTrack, true)   // justo en el límite cuenta
})

test('grow: el criterio se da vuelta', () => {
  const grow = { kind: 'grow' as const, budget_minutes: 60 }
  assert.equal(balance(grow, 300, 7).onTrack, false) // 300 < 420, no llegaste
  assert.equal(balance(grow, 500, 7).onTrack, true)
})

test('el balance proyecta el ritmo real, no el presupuestado', () => {
  // 145 min por día durante 7 días, contra un presupuesto de 120
  const b = balance({ kind: 'cut', budget_minutes: 120 }, 145 * 7, 7)
  assert.equal(b.dailyAvg, 145)
  assert.equal(b.diff, 175)
  assert.equal(Math.round(b.yearlyAtThisRate / 60), 882) // vs 730 h presupuestadas
})

test('rango de cero días no divide por cero', () => {
  const b = balance({ kind: 'cut', budget_minutes: 120 }, 0, 0)
  assert.equal(b.dailyAvg, 0)
  assert.equal(b.yearlyAtThisRate, 0)
})

test('habitProgress cuenta solo los días que tocaban', () => {
  const days = rangeDays('2026-08-30', 7) // lun 24 a dom 30
  const lmv = { weekdays: [1, 3, 5], times_per_day: 1, times_per_week: null }
  assert.equal(habitProgress(lmv, days, 2).expected, 3)
  assert.equal(habitProgress(lmv, days, 3).ratio, 1)
})

test('la meta semanal fijada se prorratea por semana', () => {
  const h = { weekdays: null, times_per_day: 1, times_per_week: 4 }
  assert.equal(habitProgress(h, rangeDays('2026-08-30', 7), 0).expected, 4)
  assert.equal(habitProgress(h, rangeDays('2026-08-30', 14), 0).expected, 8)
})

test('un hábito sin nada esperado no da ratio infinito', () => {
  const h = { weekdays: [1], times_per_day: 1, times_per_week: null }
  assert.equal(habitProgress(h, ['2026-08-30'], 0).ratio, 0) // domingo, no tocaba
})

test('formatDiff marca el signo', () => {
  assert.equal(formatDiff(175), '+2 h 55 min')
  assert.equal(formatDiff(-45), '−45 min')
  assert.equal(formatPercent(0.666), '67%')
})

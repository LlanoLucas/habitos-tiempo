import { test } from 'node:test'
import assert from 'node:assert/strict'
import { project, projectAll, formatHours, formatMinutes, todayISO, shiftDay } from './time.ts'

test('el ejemplo del brief: 2 h por día son 730 h al año', () => {
  assert.equal(project(120, 'year') / 60, 730)
})

test('las proyecciones son consistentes entre sí', () => {
  const p = projectAll(120)
  assert.equal(p.week, 840)
  assert.equal(p.month * 12, p.year) // el mes es exactamente un doceavo del año
  assert.equal(p.day, 120)
})

test('cero minutos proyecta cero', () => {
  assert.deepEqual(projectAll(0), { day: 0, week: 0, month: 0, year: 0 })
})

test('formatHours usa coma decimal abajo de 100 h y redondea arriba', () => {
  assert.equal(formatHours(750), '12,5 h')
  assert.equal(formatHours(43800), '730 h')
})

test('formatMinutes no produce "0 h 60 min"', () => {
  assert.equal(formatMinutes(90), '1 h 30 min')
  assert.equal(formatMinutes(59.7), '1 h 0 min')
  assert.equal(formatMinutes(45), '45 min')
})

test('todayISO usa la fecha local, no UTC', () => {
  // 23:30 local: con toISOString() en GMT-3 esto daría el día siguiente.
  assert.equal(todayISO(new Date(2026, 0, 5, 23, 30)), '2026-01-05')
  assert.equal(todayISO(new Date(2026, 11, 31, 0, 5)), '2026-12-31')
})

test('shiftDay cruza fin de mes y de año', () => {
  assert.equal(shiftDay('2026-08-29', 1), '2026-08-30')
  assert.equal(shiftDay('2026-08-31', 1), '2026-09-01')
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31')
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29') // bisiesto
})

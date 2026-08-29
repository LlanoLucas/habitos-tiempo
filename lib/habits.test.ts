import { test } from 'node:test'
import assert from 'node:assert/strict'
import { weeklyGoal, describeDays, isoWeekday, isDue } from './habits.ts'

test('sin días marcados la meta asume los 7', () => {
  assert.equal(weeklyGoal({ weekdays: null, times_per_day: 1, times_per_week: null }), 7)
  assert.equal(weeklyGoal({ weekdays: [], times_per_day: 2, times_per_week: null }), 14)
})

test('la meta se deriva de días × veces por día', () => {
  assert.equal(weeklyGoal({ weekdays: [1, 3, 5], times_per_day: 2, times_per_week: null }), 6)
})

test('la meta explícita le gana a la derivada', () => {
  assert.equal(weeklyGoal({ weekdays: [1, 3, 5], times_per_day: 2, times_per_week: 4 }), 4)
})

test('meta explícita de 0 no se confunde con "sin meta"', () => {
  // ?? y no ||: un 0 explícito tiene que sobrevivir
  assert.equal(weeklyGoal({ weekdays: [1], times_per_day: 3, times_per_week: 0 }), 0)
})

test('describeDays', () => {
  assert.equal(describeDays(null), 'Todos los días')
  assert.equal(describeDays([1, 3, 5]), 'Lun · Mié · Vie')
  assert.equal(describeDays([5, 1, 3]), 'Lun · Mié · Vie') // ordena por día, no por carga
})

test('isoWeekday: lunes es 1, domingo es 7', () => {
  assert.equal(isoWeekday('2026-08-31'), 1) // lunes
  assert.equal(isoWeekday('2026-08-30'), 7) // domingo
})

test('isDue: sin días marcados toca todos los días', () => {
  assert.equal(isDue({ weekdays: null }, '2026-08-30'), true)
  assert.equal(isDue({ weekdays: [] }, '2026-08-30'), true)
  assert.equal(isDue({ weekdays: [1, 3, 5] }, '2026-08-31'), true)  // lunes
  assert.equal(isDue({ weekdays: [1, 3, 5] }, '2026-08-30'), false) // domingo
})

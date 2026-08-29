'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; ok?: boolean }

type Fields = {
  name: string
  weekdays: number[] | null
  times_per_day: number
  times_per_week: number | null
}

type Parsed = { ok: false; error: string } | { ok: true; value: Fields }

function parse(formData: FormData): Parsed {
  const name = String(formData.get('name') ?? '').trim()
  const timesPerDay = Number(formData.get('times_per_day'))
  const rawWeek = String(formData.get('times_per_week') ?? '').trim()

  if (!name) return { ok: false, error: 'Poné un nombre.' }
  if (name.length > 80) return { ok: false, error: 'El nombre no puede pasar de 80 caracteres.' }
  if (!Number.isInteger(timesPerDay) || timesPerDay < 1 || timesPerDay > 50) {
    return { ok: false, error: 'Las veces por día van de 1 a 50.' }
  }

  const days = formData
    .getAll('weekdays')
    .map(Number)
    .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7)
  const weekdays = days.length === 0 || days.length === 7 ? null : [...new Set(days)].sort()

  // Vacío = derivar la meta de los días. No es lo mismo que un 0 explícito.
  let timesPerWeek: number | null = null
  if (rawWeek !== '') {
    timesPerWeek = Number(rawWeek)
    if (!Number.isInteger(timesPerWeek) || timesPerWeek < 1 || timesPerWeek > 350) {
      return { ok: false, error: 'La meta semanal va de 1 a 350, o dejala vacía.' }
    }
  }

  return { ok: true, value: { name, weekdays, times_per_day: timesPerDay, times_per_week: timesPerWeek } }
}

export async function saveHabit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parse(formData)
  if (!parsed.ok) return { error: parsed.error }

  const id = formData.get('id')
  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('habits').update(parsed.value).eq('id', String(id))
    : await supabase.from('habits').insert(parsed.value)

  if (error) return { error: error.message }
  revalidatePath('/habits')
  return { ok: true }
}

export async function deleteHabit(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  // Los habit_logs se van solos por el ON DELETE CASCADE.
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw new Error(`No se pudo borrar: ${error.message}`)
  revalidatePath('/habits')
}

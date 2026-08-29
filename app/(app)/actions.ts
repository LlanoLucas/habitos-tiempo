'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MINUTES_PER_DAY } from '@/lib/time'

export type ActionState = { error?: string; ok?: boolean }

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

function day(formData: FormData): string | null {
  const d = String(formData.get('day') ?? '')
  return ISO_DAY.test(d) ? d : null
}

export async function addTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim()
  const d = day(formData)

  if (!title) return { error: 'Escribí algo.' }
  if (title.length > 200) return { error: 'Máximo 200 caracteres.' }
  if (!d) return { error: 'Fecha inválida.' }

  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert({
    title,
    day: d,
    is_reminder: formData.get('is_reminder') === 'on',
  })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}

export async function toggleTask(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ done: formData.get('done') !== 'true' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteTask(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

/** Suma o resta una repetición del hábito en ese día. En 0 borra la fila. */
export async function logHabit(formData: FormData): Promise<void> {
  const habitId = String(formData.get('habit_id') ?? '')
  const d = day(formData)
  const next = Number(formData.get('next'))
  if (!habitId || !d || !Number.isInteger(next) || next < 0 || next > 999) return

  const supabase = await createClient()
  const { error } =
    next === 0
      ? await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('day', d)
      : await supabase.from('habit_logs').upsert({ habit_id: habitId, day: d, count: next })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

/** Minutos reales gastados en una actividad ese día. Un 0 explícito se guarda. */
export async function logTime(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const activityId = String(formData.get('activity_id') ?? '')
  const d = day(formData)
  const minutes = Number(formData.get('minutes'))

  if (!activityId || !d) return { error: 'Datos incompletos.' }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > MINUTES_PER_DAY) {
    return { error: `Los minutos van de 0 a ${MINUTES_PER_DAY}.` }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('time_logs')
    .upsert({ activity_id: activityId, day: d, minutes })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}

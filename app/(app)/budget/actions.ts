'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MINUTES_PER_DAY } from '@/lib/time'

export type ActionState = { error?: string; ok?: boolean }

type Parsed =
  | { ok: false; error: string }
  | { ok: true; value: { name: string; kind: 'grow' | 'cut'; budget_minutes: number } }

// Validación en el borde: lo que llega del form es texto arbitrario.
// Los CHECK de la base son el segundo cinturón, no el primero.
function parse(formData: FormData): Parsed {
  const name = String(formData.get('name') ?? '').trim()
  const kind = formData.get('kind')
  const minutes = Number(formData.get('budget_minutes'))

  if (!name) return { ok: false, error: 'Poné un nombre.' }
  if (name.length > 80) return { ok: false, error: 'El nombre no puede pasar de 80 caracteres.' }
  if (kind !== 'grow' && kind !== 'cut') return { ok: false, error: 'Elegí fomentar o recortar.' }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > MINUTES_PER_DAY) {
    return { ok: false, error: `Los minutos por día van de 0 a ${MINUTES_PER_DAY}.` }
  }
  return { ok: true, value: { name, kind, budget_minutes: minutes } }
}

/** Crea si no viene id, actualiza si viene. Mismo formulario para los dos casos. */
export async function saveActivity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parse(formData)
  if (!parsed.ok) return { error: parsed.error }

  const id = formData.get('id')
  const supabase = await createClient()

  // user_id lo pone el DEFAULT auth.uid() de la base; el cliente nunca lo manda.
  const { error } = id
    ? await supabase.from('activities').update(parsed.value).eq('id', String(id))
    : await supabase.from('activities').insert(parsed.value)

  if (error) return { error: error.message }
  revalidatePath('/budget')
  return { ok: true }
}

export async function deleteActivity(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw new Error(`No se pudo borrar: ${error.message}`)
  revalidatePath('/budget')
}

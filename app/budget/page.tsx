import { createClient } from '@/lib/supabase/server'
import { formatHours, formatMinutes, projectAll, MINUTES_PER_DAY } from '@/lib/time'
import type { Activity } from '@/lib/database.types'
import ActivityForm from './activity-form'
import { deleteActivity } from './actions'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('archived', false)
    .order('kind')
    .order('name')

  if (error) return <main><p role="alert">No se pudieron cargar las actividades: {error.message}</p></main>

  const activities = data ?? []
  const grow = activities.filter((a) => a.kind === 'grow')
  const cut = activities.filter((a) => a.kind === 'cut')
  const budgeted = activities.reduce((sum, a) => sum + a.budget_minutes, 0)
  const free = MINUTES_PER_DAY - budgeted

  return (
    <main>
      <h1>Presupuesto de tiempo</h1>

      <section>
        <h2>Nueva actividad</h2>
        <ActivityForm />
      </section>

      <section>
        <h2>El día tiene 24 h</h2>
        <ul>
          <li>Presupuestado: {formatMinutes(budgeted)} por día</li>
          <li>{free >= 0 ? `Libre: ${formatMinutes(free)}` : `Te pasaste por ${formatMinutes(-free)}`}</li>
        </ul>
        {free < 0 && <p role="alert">El presupuesto no entra en un día. Recortá algo.</p>}
      </section>

      <Group title="Fomentar" items={grow} />
      <Group title="Recortar" items={cut} />
    </main>
  )
}

function Group({ title, items }: { title: string; items: Activity[] }) {
  const daily = items.reduce((sum, a) => sum + a.budget_minutes, 0)

  return (
    <section>
      <h2>
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p>Todavía no cargaste nada acá.</p>
      ) : (
        <>
          <ul>
            {items.map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </ul>
          <p>
            Subtotal: {formatMinutes(daily)} por día = {formatHours(projectAll(daily).year)} al año
          </p>
        </>
      )}
    </section>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const p = projectAll(activity.budget_minutes)

  return (
    <li>
      <h3>{activity.name}</h3>
      <p>{formatMinutes(p.day)} por día</p>
      <dl>
        <dt>Semana</dt>
        <dd>{formatHours(p.week)}</dd>
        <dt>Mes</dt>
        <dd>{formatHours(p.month)}</dd>
        <dt>Año</dt>
        <dd>{formatHours(p.year)}</dd>
      </dl>

      <details>
        <summary>Editar</summary>
        <ActivityForm activity={activity} />
      </details>

      <form action={deleteActivity}>
        <input type="hidden" name="id" value={activity.id} />
        <button type="submit">Borrar</button>
      </form>
    </li>
  )
}

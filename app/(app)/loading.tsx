/**
 * Frontera de Suspense: Next prefetchea este esqueleto, así el tap pinta algo
 * al instante en vez de esperar el viaje a la base.
 */
export default function Loading() {
  return (
    <main aria-busy="true">
      <div className="skeleton" style={{ width: '40%', height: '1.5rem' }} />
      <div className="skeleton" style={{ height: '5rem' }} />
      <div className="skeleton" style={{ height: '5rem' }} />
      <div className="skeleton" style={{ height: '5rem' }} />
    </main>
  )
}

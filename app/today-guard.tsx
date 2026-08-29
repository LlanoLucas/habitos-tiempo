'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { todayISO } from '@/lib/time'

/**
 * El server no conoce la zona horaria del browser. Si su "hoy" no coincide con el
 * del celular, corregimos la URL una vez. Sin esto, deployado en UTC, después de
 * las 21:00 en GMT-3 la app abriría el día equivocado.
 */
export default function TodayGuard({ serverDay }: { serverDay: string }) {
  const router = useRouter()

  useEffect(() => {
    const local = todayISO()
    if (local !== serverDay) router.replace(`/?d=${local}`)
  }, [serverDay, router])

  return null
}

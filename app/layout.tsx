import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hábitos + Tiempo',
  description: 'Seguimiento de hábitos y presupuesto de tiempo',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

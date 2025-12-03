import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navigation } from '@/components/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Wikiclase - Cursos de Español, Literatura y más',
  description: 'Plataforma integral de cursos de español como lengua extranjera (ELE), literatura, metodología educativa y proyectos culturales por Javier Benítez Láinez',
  keywords: ['español', 'ELE', 'literatura', 'cursos online', 'educación', 'poesía'],
  authors: [{ name: 'Javier Benítez Láinez' }],
  openGraph: {
    title: 'La Wikiclase - Cursos de Español y Literatura',
    description: 'Aprende español, literatura y metodología educativa con cursos profesionales online',
    type: 'website',
    locale: 'es_ES',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body className={inter.className}>
          <Navigation />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

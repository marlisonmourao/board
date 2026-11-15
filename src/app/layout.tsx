import { ReactQueryProvider } from '@/lib/react-query'
import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import './globals.css'

const plexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-plex-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s | Quadro do produto',
    default: 'Quadro do produto',
  },
  description: 'Acompanhe o que está em andamento e o que vem a seguir.',
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={plexSans.className}>
      <body className="bg-navy-950 text-navy-50 antialiased">
        <ReactQueryProvider>
          <NuqsAdapter>
            <Suspense fallback={null}>{modal}</Suspense>
            {children}
          </NuqsAdapter>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

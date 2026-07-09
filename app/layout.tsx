import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: { default: 'SimRacer Hub', template: '%s | SimRacer Hub' },
  description: 'Community hub for sim racers — events, teams, and game ratings across iRacing, ACC, rFactor 2, and more.',
  openGraph: {
    title: 'SimRacer Hub',
    description: 'Find events. Build teams. Rate every update.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface antialiased flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 animate-fade-in">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

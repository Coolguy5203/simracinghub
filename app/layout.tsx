import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { BottomNav } from '@/components/BottomNav'
import { SWRegister } from '@/components/SWRegister'

export const metadata: Metadata = {
  title: { default: 'SimRacer Hub', template: '%s | SimRacer Hub' },
  description: 'Community hub for sim racers — events, teams, and game ratings across iRacing, ACC, rFactor 2, and more.',
  openGraph: {
    title: 'SimRacer Hub',
    description: 'Find events. Build teams. Rate every update.',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SimRacer Hub',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1117',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface antialiased flex flex-col">
        <SWRegister />
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 animate-fade-in pb-24 md:pb-8">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  )
}

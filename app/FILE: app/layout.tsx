import type { Metadata, Viewport } from 'next'
import { Syne, DM_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
 
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})
 
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
})
 
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})
 
export const metadata: Metadata = {
  title: 'Broke Social — Plan the move. Split the damage.',
  description: 'The group page for your night out. Budget it, split it, recap it.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://brokesocial.app'),
}
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        <main className="max-w-md mx-auto min-h-screen-mobile relative">
          {children}
        </main>
      </body>
    </html>
  )
}
 

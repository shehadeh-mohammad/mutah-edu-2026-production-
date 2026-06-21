import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import FloatingCreatorsCredits from '@/components/layout/FloatingCreatorsCredits'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'MutahEdu | AI-Powered Academic Platform',
  description:
    'A smart digital platform that integrates academic services, educational resources, and AI-powered tools to support university students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${tajawal.variable}`}>
      <body className={tajawal.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <FloatingCreatorsCredits />
        </ThemeProvider>
      </body>
    </html>
  )
}

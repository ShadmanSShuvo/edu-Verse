import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import AIChatWidget from '@/components/ai-chat-client'
import { ThemeProvider } from '@/components/theme-provider'
import { NavigationProgressBar } from '@/components/top-loader'
import PageTransitionProvider from '@/components/ui/PageTransitionProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "eduVerse 2026 - AI Powered E-learning Platform",
  description: "eduVerse is an AI powered online learning platform for courses, exams and progress tracking.",
  keywords: ["eduverse", "eduverse 2026", "online learning platform", "AI education"],
  authors: [{ name: "Shadman Shahriyar Shuvo" }, { name: "Mutammim Irtiza Islam" }],
  verification: {
    google: "T2-aVzkuu-rkMu-qQyQ5ByS9R_waZrpCK2nlgfVHvbY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Global navigation progress bar — auto-detects route changes */}
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
          <AIChatWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}

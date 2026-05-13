import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: '고구마마켓 - 따뜻한 중고거래',
  description: '믿을 수 있는 동네 중고거래, 고구마마켓',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-orange-50">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}

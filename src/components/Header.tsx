'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-orange-500 shrink-0 flex items-center gap-1">
          🍠 <span className="hidden sm:inline">고구마마켓</span>
        </Link>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="어떤 물건을 찾고 계신가요?"
            className="w-full px-4 py-2 rounded-full border border-orange-200 text-sm focus:outline-none focus:border-orange-400 bg-orange-50"
          />
        </form>

        {/* 판매하기 */}
        <Link
          href="/products/new"
          className="shrink-0 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
        >
          + 판매하기
        </Link>

        {/* 로그인 */}
        <Link
          href="/login"
          className="shrink-0 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          로그인
        </Link>
      </div>
    </header>
  )
}

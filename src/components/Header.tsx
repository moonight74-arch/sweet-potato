'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  nickname: string
  avatar_url: string | null
}

export default function Header() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).single()
        setProfile(data as Profile)
      }
      setAuthLoaded(true)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null)
      } else {
        supabase.from('profiles').select('nickname, avatar_url').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data as Profile))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-orange-500 shrink-0 flex items-center gap-1">
          🍠 <span className="hidden sm:inline">고구마마켓</span>
        </Link>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색"
            className="w-full px-3 sm:px-4 py-2 rounded-full border border-orange-200 text-sm focus:outline-none focus:border-orange-400 bg-orange-50"
          />
        </form>

        {/* 판매하기 */}
        <Link
          href="/products/new"
          className="shrink-0 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <span className="sm:hidden text-xl leading-none">+</span>
          <span className="hidden sm:inline">+ 판매하기</span>
        </Link>

        {/* 로그인 상태 */}
        {authLoaded && (
          profile ? (
            <>
              <Link href="/chat" className="shrink-0 text-gray-400 hover:text-orange-500 transition-colors" title="채팅">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </Link>
              <Link href="/mypage" className="shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm overflow-hidden">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="프로필" width={32} height={32} className="object-cover rounded-full" />
                  ) : (
                    profile.nickname?.[0] ?? '?'
                  )}
                </div>
                <span className="hidden sm:inline text-sm text-gray-700">{profile.nickname}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="shrink-0 text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              로그인
            </Link>
          )
        )}
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('이메일과 비밀번호를 입력해주세요.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍠</div>
          <h1 className="text-2xl font-bold text-gray-900">고구마마켓</h1>
          <p className="text-sm text-gray-400 mt-1">따뜻한 중고거래 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-orange-500 font-medium hover:underline">
            회원가입
          </Link>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-center text-gray-400 hover:text-orange-500 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}

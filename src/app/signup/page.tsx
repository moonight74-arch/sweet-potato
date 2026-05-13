'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nickname: '', email: '', password: '', passwordConfirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    if (!form.nickname || !form.email || !form.password || !form.passwordConfirm) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (form.nickname.length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nickname: form.nickname } },
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 사용 중인 이메일입니다.')
      } else {
        setError(error.message)
      }
      return
    }

    // 이메일 확인이 비활성화된 경우 세션이 바로 생성됨
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      // 이메일 확인이 필요한 경우
      setDone(true)
    }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-orange-500">{form.email}</span>로<br />
          인증 메일을 보냈습니다. 링크를 클릭하면 로그인됩니다.
        </p>
        <Link href="/login" className="text-sm text-orange-500 hover:underline">
          로그인 페이지로 이동
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍠</div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-400 mt-1">고구마마켓에 오신 걸 환영해요!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임 <span className="text-orange-500">*</span>
            </label>
            <input
              name="nickname"
              type="text"
              value={form.nickname}
              onChange={handleChange}
              placeholder="닉네임 (2자 이상)"
              autoComplete="nickname"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-orange-500">*</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-orange-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="6자 이상"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인 <span className="text-orange-500">*</span>
            </label>
            <input
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
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
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}

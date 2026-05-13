'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  async function signInWithKakao() {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍠</div>
          <h1 className="text-2xl font-bold text-gray-900">고구마마켓</h1>
          <p className="text-sm text-gray-400 mt-1">따뜻한 중고거래 플랫폼</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          {/* 카카오 */}
          <button
            onClick={signInWithKakao}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FEE500', color: '#000000' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5C4.86 1.5 1.5 4.14 1.5 7.38c0 2.1 1.38 3.93 3.45 4.98L4.2 15l3.51-2.31c.42.06.84.09 1.29.09 4.14 0 7.5-2.64 7.5-5.88S13.14 1.5 9 1.5z" fill="#000000"/>
            </svg>
            카카오로 시작하기
          </button>

          {/* 구글 */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 font-medium text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            구글로 시작하기
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          로그인 시 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의합니다.
        </p>

        {/* 돌아가기 */}
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

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function FailContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') ?? '결제가 취소되었습니다.'
  const code = searchParams.get('code')

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">😅</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h1>
      <p className="text-sm text-gray-500 mb-1">{message}</p>
      {code && <p className="text-xs text-gray-300 mb-6">코드: {code}</p>}
      <div className="flex flex-col gap-3 items-center mt-6">
        <button
          onClick={() => window.history.back()}
          className="w-full max-w-xs py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          다시 시도하기
        </button>
        <Link href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">로딩 중...</div>}>
      <FailContent />
    </Suspense>
  )
}

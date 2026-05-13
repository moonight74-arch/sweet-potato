'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      return
    }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStatus('done')
        else { setStatus('error'); setErrorMsg(data.error ?? '결제 승인 실패') }
      })
      .catch(() => { setStatus('error'); setErrorMsg('네트워크 오류가 발생했습니다.') })
  }, [searchParams, router])

  if (status === 'loading') return (
    <div className="text-center py-20">
      <div className="text-orange-400 text-lg animate-pulse">결제 확인 중...</div>
    </div>
  )

  if (status === 'error') return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">😢</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">결제 처리 실패</h1>
      <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
      <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
        홈으로 돌아가기
      </Link>
    </div>
  )

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
      <p className="text-sm text-gray-500 mb-8">상품이 성공적으로 구매되었습니다.<br />판매자에게 채팅으로 거래를 진행해 주세요.</p>
      <div className="flex flex-col gap-3 items-center">
        <Link href="/chat" className="w-full max-w-xs py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
          채팅으로 거래하기
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-orange-400 animate-pulse">확인 중...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

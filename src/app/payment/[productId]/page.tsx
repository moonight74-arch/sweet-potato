'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  title: string
  price: number
  image_url: string | null
  status: string
  seller_id: string
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString('ko-KR')}`
}

function generateOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export default function PaymentPage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const widgetRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof loadTossPayments>>['widgets']>> | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [orderId] = useState(generateOrderId)
  const [ready, setReady] = useState(false)
  const [paying, setPaying] = useState(false)
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase.from('products').select('*').eq('id', productId).single()
      if (!data) { router.push('/'); return }
      if (data.status === '판매완료') { alert('이미 판매 완료된 상품입니다.'); router.back(); return }
      if (data.seller_id === user.id) { alert('내 상품은 구매할 수 없습니다.'); router.back(); return }

      setProduct(data as Product)
      setReady(true)
    }
    load()
  }, [productId, router])

  useEffect(() => {
    if (!ready || !product || widgetLoaded) return

    async function initWidget() {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      const tossPayments = await loadTossPayments(clientKey)
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS })

      await widgets.setAmount({ currency: 'KRW', value: product!.price })
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
      ])

      widgetRef.current = widgets
      setWidgetLoaded(true)
    }

    initWidget()
  }, [ready, product, widgetLoaded])

  async function handlePay() {
    if (!widgetRef.current || !product || !userId || paying) return
    setPaying(true)

    const supabase = createClient()
    await supabase.from('payments').insert({
      product_id: product.id,
      buyer_id: userId,
      seller_id: product.seller_id,
      order_id: orderId,
      amount: product.price,
      status: '결제대기',
    })

    await widgetRef.current.requestPayment({
      orderId,
      orderName: product.title,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    })

    setPaying(false)
  }

  if (!product) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-orange-500">←</button>
        <h1 className="text-xl font-bold text-gray-900">결제하기</h1>
      </div>

      {/* 상품 요약 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.title} width={80} height={80} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍠</div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{product.title}</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{formatPrice(product.price)}</p>
        </div>
      </div>

      {/* 토스페이먼츠 위젯 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <div id="payment-method" className="min-h-[200px]" />
        <div id="agreement" />
      </div>

      {/* 결제 버튼 */}
      <button
        onClick={handlePay}
        disabled={!widgetLoaded || paying}
        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {paying ? '결제 진행 중...' : !widgetLoaded ? '결제 수단 로딩 중...' : `${formatPrice(product.price)} 결제하기`}
      </button>
    </div>
  )
}

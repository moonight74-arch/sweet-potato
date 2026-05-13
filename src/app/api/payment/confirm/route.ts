import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { paymentKey, orderId, amount } = await request.json()

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
  }

  // 토스페이먼츠 결제 승인
  const secretKey = process.env.TOSS_SECRET_KEY!
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  if (!tossRes.ok) {
    const err = await tossRes.json()
    return NextResponse.json({ error: err.message ?? '결제 승인 실패' }, { status: 400 })
  }

  const tossData = await tossRes.json()

  // DB 업데이트
  const supabase = await createClient()
  const { data: payment } = await supabase
    .from('payments')
    .update({ payment_key: paymentKey, status: '결제완료' })
    .eq('order_id', orderId)
    .select('product_id')
    .single()

  if (payment?.product_id) {
    await supabase
      .from('products')
      .update({ status: '판매완료' })
      .eq('id', payment.product_id)
  }

  return NextResponse.json({ success: true, payment: tossData })
}

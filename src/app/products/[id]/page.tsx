'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  image_url: string | null
  status: string
  like_count: number
  view_count: number
  created_at: string
  seller_id: string
  profiles: { nickname: string; location: string | null } | null
}

const STATUS_STYLE: Record<string, string> = {
  '판매중':   'bg-green-100 text-green-700',
  '예약중':   'bg-yellow-100 text-yellow-700',
  '판매완료': 'bg-gray-100 text-gray-500',
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString('ko-KR')}`
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, profiles(nickname, location)')
        .eq('id', id)
        .single()

      if (!data) { router.push('/'); return }
      setProduct(data as unknown as Product)

      // 조회수 증가
      await supabase.from('products').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id)
      setLoading(false)
    }
    load()
  }, [id, router])

  function toggleLike() {
    if (!product) return
    setLiked(prev => !prev)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  if (!product) return null

  const seller = product.profiles

  return (
    <div className="max-w-2xl mx-auto">
      {/* 뒤로가기 */}
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500">
        ← 뒤로가기
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* 이미지 */}
        <div className="relative aspect-square bg-gray-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.title} fill className="object-cover" sizes="672px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🍠</div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* 판매자 */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
              {seller?.nickname?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-medium text-sm">{seller?.nickname ?? '알 수 없음'}</p>
              <p className="text-xs text-gray-400">{seller?.location ?? product.location}</p>
            </div>
          </div>

          {/* 상품 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[product.status]}`}>
                {product.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
            <p className="mt-1 text-sm text-gray-400">{product.category} · {product.location}</p>
            <p className="mt-3 text-2xl font-bold text-orange-500">{formatPrice(product.price)}</p>
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>

          {/* 조회수/찜 */}
          <p className="text-xs text-gray-300">
            조회 {product.view_count + 1} · 찜 {product.like_count + (liked ? 1 : 0)}
          </p>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                liked ? 'border-orange-400 text-orange-500 bg-orange-50' : 'border-gray-200 text-gray-500 hover:border-orange-300'
              }`}
            >
              {liked ? '❤️' : '🤍'} 찜하기
            </button>
            <button className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
              채팅으로 거래하기
            </button>
          </div>
        </div>
      </div>

      {/* 목록으로 */}
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-orange-500">목록으로 돌아가기</Link>
      </div>
    </div>
  )
}

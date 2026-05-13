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
  const [isOwner, setIsOwner] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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

      await supabase.from('products').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsOwner(user.id === data.seller_id)
        setCurrentUserId(user.id)
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  function toggleLike() {
    if (!product) return
    setLiked(prev => !prev)
  }

  async function handleStartChat() {
    if (!currentUserId) { router.push('/login'); return }
    if (!product) return
    if (isOwner) return

    setChatLoading(true)
    const supabase = createClient()

    // 기존 채팅방 확인
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('product_id', product.id)
      .eq('buyer_id', currentUserId)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({ product_id: product.id, buyer_id: currentUserId, seller_id: product.seller_id })
      .select('id')
      .single()

    setChatLoading(false)
    if (error || !newRoom) { alert('채팅방 생성 실패: ' + error?.message); return }
    router.push(`/chat/${newRoom.id}`)
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('삭제 실패: ' + error.message)
      setDeleting(false)
      return
    }
    router.push('/')
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
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500">
          ← 뒤로가기
        </button>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${id}/edit`}
              className="px-3 py-1.5 text-sm text-orange-500 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

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
            {!isOwner && (
              <div className="flex-1 flex gap-2">
                <button
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="flex-1 py-3 border border-orange-400 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  {chatLoading ? '연결 중...' : '채팅하기'}
                </button>
                <Link
                  href={`/payment/${product.id}`}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold text-center hover:bg-orange-600 transition-colors"
                >
                  바로 구매
                </Link>
              </div>
            )}
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

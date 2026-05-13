'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ChatRoom {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  products: { id: string; title: string; image_url: string | null } | null
  buyer: { nickname: string; avatar_url: string | null } | null
  seller: { nickname: string; avatar_url: string | null } | null
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function ChatListPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          products(id, title, image_url),
          buyer:profiles!buyer_id(nickname, avatar_url),
          seller:profiles!seller_id(nickname, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      setRooms((data ?? []) as unknown as ChatRoom[])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">채팅</h1>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
          <p className="text-3xl mb-3">💬</p>
          <p className="text-sm">진행 중인 채팅이 없습니다.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map(room => {
            const isBuyer = room.buyer_id === userId
            const other = isBuyer ? room.seller : room.buyer
            const product = room.products

            return (
              <Link key={room.id} href={`/chat/${room.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  {/* 상품 이미지 */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 shrink-0">
                    {product?.image_url ? (
                      <Image src={product.image_url} alt={product.title ?? ''} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🍠</div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* 상대방 아바타 */}
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0 overflow-hidden">
                        {other?.avatar_url ? (
                          <Image src={other.avatar_url} alt="" width={24} height={24} className="object-cover rounded-full" />
                        ) : (
                          other?.nickname?.[0] ?? '?'
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{other?.nickname ?? '알 수 없음'}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product?.title ?? '상품 없음'}</p>
                  </div>

                  <p className="text-xs text-gray-300 shrink-0">{timeAgo(room.created_at)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
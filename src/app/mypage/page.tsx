'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  title: string
  price: number
  image_url: string | null
  status: string
  like_count: number
  created_at: string
}

interface Profile {
  id: string
  nickname: string
  location: string | null
  avatar_url: string | null
}

const STATUS_STYLE: Record<string, string> = {
  '판매중':   'bg-green-100 text-green-700',
  '예약중':   'bg-yellow-100 text-yellow-700',
  '판매완료': 'bg-gray-100 text-gray-500',
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString('ko-KR')}`
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

type Tab = 'selling' | 'likes'

export default function MyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [likedProducts, setLikedProducts] = useState<Product[]>([])
  const [tab, setTab] = useState<Tab>('selling')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, myRes, likesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('likes').select('products(*)').eq('user_id', user.id),
      ])

      setProfile(profileRes.data as Profile)
      setMyProducts((myRes.data ?? []) as Product[])

      const liked = (likesRes.data ?? [])
        .map((r: { products: unknown }) => r.products)
        .filter(Boolean) as Product[]
      setLikedProducts(liked)

      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  const displayProducts = tab === 'selling' ? myProducts : likedProducts

  return (
    <div className="max-w-2xl mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500 overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="프로필" width={64} height={64} className="object-cover rounded-full" />
            ) : (
              profile?.nickname?.[0] ?? '?'
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">{profile?.nickname ?? '사용자'}</p>
            {profile?.location && <p className="text-sm text-gray-400 mt-0.5">{profile.location}</p>}
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            로그아웃
          </button>
        </div>

        {/* 요약 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{myProducts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">등록 상품</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{likedProducts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">찜한 상품</p>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('selling')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'selling' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-orange-50'}`}
        >
          내 판매 상품
        </button>
        <button
          onClick={() => setTab('likes')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'likes' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-orange-50'}`}
        >
          찜한 상품
        </button>
      </div>

      {/* 상품 목록 */}
      {displayProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
          <p className="text-3xl mb-3">🍠</p>
          <p className="text-sm">{tab === 'selling' ? '등록한 상품이 없습니다.' : '찜한 상품이 없습니다.'}</p>
          {tab === 'selling' && (
            <Link href="/products/new" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
              첫 상품 등록하기
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayProducts.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 shrink-0">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.title} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍠</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[product.status]}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate">{product.title}</p>
                  <p className="text-base font-bold text-orange-500 mt-0.5">{formatPrice(product.price)}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(product.created_at)} · 찜 {product.like_count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

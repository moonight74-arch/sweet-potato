'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'

interface Product {
  id: string
  title: string
  price: number
  location: string
  image_url: string | null
  status: string
  like_count: number
  created_at: string
  profiles: { nickname: string } | null
}

function ProductList() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('products')
      .select('id, title, price, location, image_url, status, like_count, created_at, profiles(nickname)')
      .order('created_at', { ascending: false })

    if (category !== 'all') query = query.eq('category', category)
    if (q) query = query.ilike('title', `%${q}%`)

    const { data } = await query
    setProducts((data as unknown as Product[]) ?? [])
    setLoading(false)
  }, [category, q])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <div className="space-y-4">
      {q && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-orange-500">"{q}"</span> 검색 결과 {products.length}개
        </p>
      )}

      <CategoryFilter selected={category} onChange={setCategory} />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="text-5xl mb-4">🍠</span>
          <p className="text-lg font-medium">상품이 없습니다</p>
          <p className="text-sm mt-1">첫 번째 상품을 등록해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <ProductList />
    </Suspense>
  )
}

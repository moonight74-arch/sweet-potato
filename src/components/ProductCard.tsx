import Link from 'next/link'
import Image from 'next/image'

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

const STATUS_STYLE: Record<string, string> = {
  '판매중':  'bg-green-100 text-green-700',
  '예약중':  'bg-yellow-100 text-yellow-700',
  '판매완료': 'bg-gray-100 text-gray-500',
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString('ko-KR')}`
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        {/* 이미지 */}
        <div className="relative aspect-square bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍠</div>
          )}
          {/* 상태 뱃지 */}
          {product.status !== '판매중' && (
            <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[product.status]}`}>
              {product.status}
            </span>
          )}
        </div>

        {/* 정보 */}
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.title}</p>
          <p className="mt-1 text-sm font-bold text-orange-500">{formatPrice(product.price)}</p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
            <span>{product.location}</span>
            <span>{timeAgo(product.created_at)}</span>
          </div>
          {product.like_count > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <span>❤️</span>
              <span>{product.like_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

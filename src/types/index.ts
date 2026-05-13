export type ProductStatus = '판매중' | '예약중' | '판매완료'

export type Category =
  | 'all'
  | 'electronics'
  | 'clothing'
  | 'furniture'
  | 'books'
  | 'sports'
  | 'beauty'
  | 'food'
  | 'kids'
  | 'etc'

export interface Product {
  id: string
  title: string
  price: number
  category: Category
  location: string
  image_url: string | null
  description: string
  status: ProductStatus
  seller_id: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
}

export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
  location: string | null
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface ChatRoom {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  created_at: string
}

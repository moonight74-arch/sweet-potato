'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  created_at: string
  sender: { nickname: string; avatar_url: string | null } | null
}

interface RoomInfo {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  products: { id: string; title: string; image_url: string | null; price: number } | null
  buyer: { nickname: string; avatar_url: string | null } | null
  seller: { nickname: string; avatar_url: string | null } | null
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString('ko-KR')}`
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [room, setRoom] = useState<RoomInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          products(id, title, image_url, price),
          buyer:profiles!buyer_id(nickname, avatar_url),
          seller:profiles!seller_id(nickname, avatar_url)
        `)
        .eq('id', roomId)
        .single()

      if (!roomData) { router.push('/chat'); return }

      const r = roomData as unknown as RoomInfo
      if (r.buyer_id !== user.id && r.seller_id !== user.id) { router.push('/chat'); return }
      setRoom(r)

      const { data: msgData } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(nickname, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      setMessages((msgData ?? []) as unknown as Message[])
      setLoading(false)
    }

    load()

    // 실시간 구독
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const newMsg = payload.new as { id: string; sender_id: string; content: string; created_at: string; room_id: string }
          const { data: sender } = await supabase
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('id', newMsg.sender_id)
            .single()

          setMessages(prev => [...prev, { ...newMsg, sender: sender as { nickname: string; avatar_url: string | null } }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !userId || sending) return
    setSending(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: userId,
      content: input.trim(),
    })
    setInput('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  if (!room) return null

  const isBuyer = room.buyer_id === userId
  const other = isBuyer ? room.seller : room.buyer
  const product = room.products

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-7rem)]">
      {/* 헤더 */}
      <div className="bg-white rounded-t-2xl border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange-500 text-lg">←</button>

        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold shrink-0 overflow-hidden">
          {other?.avatar_url ? (
            <Image src={other.avatar_url} alt="" width={36} height={36} className="object-cover rounded-full" />
          ) : (
            other?.nickname?.[0] ?? '?'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900">{other?.nickname ?? '알 수 없음'}</p>
        </div>

        {/* 상품 미리보기 */}
        {product && (
          <Link href={`/products/${product.id}`} className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-1.5 hover:bg-orange-100 transition-colors shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white">
              {product.image_url ? (
                <Image src={product.image_url} alt="" width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm">🍠</div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600 max-w-[80px] truncate">{product.title}</p>
              <p className="text-xs font-bold text-orange-500">{formatPrice(product.price)}</p>
            </div>
          </Link>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto bg-orange-50/30 px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            첫 메시지를 보내보세요 👋
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* 아바타 (상대방만) */}
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0 overflow-hidden">
                  {msg.sender?.avatar_url ? (
                    <Image src={msg.sender.avatar_url} alt="" width={28} height={28} className="object-cover rounded-full" />
                  ) : (
                    msg.sender?.nickname?.[0] ?? '?'
                  )}
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <p className="text-xs text-gray-400 px-1">{msg.sender?.nickname}</p>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-gray-300 px-1">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white rounded-b-2xl border-t border-gray-100 px-4 py-3 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-4 py-2.5 rounded-full bg-orange-50 border border-orange-100 text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
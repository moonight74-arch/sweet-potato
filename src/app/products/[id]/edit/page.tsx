'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/components/CategoryFilter'

const LOCATIONS = ['서울 강남구', '서울 마포구', '서울 송파구', '서울 서초구', '서울 노원구', '서울 은평구', '경기 수원시', '경기 성남시', '경기 고양시', '경기 부천시', '경기 용인시', '부산 해운대구', '부산 수영구', '대전 유성구', '인천 남동구', '대구 수성구', '광주 서구', '울산 남구']
const STATUSES = ['판매중', '예약중', '판매완료']

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ title: '', price: '', category: '', location: '', description: '', status: '판매중' })
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (!data) { router.push('/'); return }
      if (data.seller_id !== user.id) { router.push(`/products/${id}`); return }

      setForm({
        title: data.title,
        price: String(data.price),
        category: data.category,
        location: data.location,
        description: data.description ?? '',
        status: data.status,
      })
      setExistingImageUrl(data.image_url)
      setLoading(false)
    }
    load()
  }, [id, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드 가능합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleImageRemove() {
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(userId: string): Promise<string | null> {
    if (!imageFile) return existingImageUrl
    setUploading(true)
    const supabase = createClient()
    const ext = imageFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { upsert: false })
    setUploading(false)
    if (error) { alert('이미지 업로드 실패: ' + error.message); return null }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title || !form.price || !form.category || !form.location) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const imageUrl = await uploadImage(user.id)

    const { error } = await supabase.from('products').update({
      title: form.title,
      price: Number(form.price),
      category: form.category,
      location: form.location,
      description: form.description,
      status: form.status,
      image_url: imageUrl,
    }).eq('id', id)

    setSubmitting(false)
    if (error) { alert('수정 실패: ' + error.message); return }
    router.push(`/products/${id}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-orange-400 text-lg animate-pulse">불러오는 중...</div>
    </div>
  )

  const currentImage = imagePreview ?? existingImageUrl

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-orange-500">←</button>
        <h1 className="text-xl font-bold text-gray-900">상품 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">

        {/* 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진 <span className="text-gray-400 font-normal">(최대 5MB)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center hover:border-orange-400 transition-colors bg-orange-50 text-orange-400"
            >
              <span className="text-2xl">+</span>
              <span className="text-xs mt-1">사진 추가</span>
            </button>
            {currentImage && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <Image src={currentImage} alt="미리보기" fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">판매 상태</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목 <span className="text-orange-500">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="상품 제목을 입력하세요"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 <span className="text-orange-500">*</span></label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            <option value="">카테고리 선택</option>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가격 <span className="text-orange-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              min={0}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* 지역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">거래 지역 <span className="text-orange-500">*</span></label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            <option value="">지역 선택</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="상품 상태, 사용 기간, 거래 방식 등을 자유롭게 적어주세요."
            rows={5}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
        </div>

        {/* 제출 */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {uploading ? '이미지 업로드 중...' : submitting ? '수정 중...' : '수정 완료'}
        </button>
      </form>
    </div>
  )
}

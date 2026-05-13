'use client'

export const CATEGORIES = [
  { id: 'all',         label: '전체' },
  { id: 'electronics', label: '전자기기' },
  { id: 'clothing',    label: '의류/잡화' },
  { id: 'furniture',   label: '가구/인테리어' },
  { id: 'books',       label: '도서' },
  { id: 'sports',      label: '스포츠/레저' },
  { id: 'beauty',      label: '뷰티/미용' },
  { id: 'kids',        label: '유아동' },
  { id: 'etc',         label: '기타' },
]

interface Props {
  selected: string
  onChange: (id: string) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat.id
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

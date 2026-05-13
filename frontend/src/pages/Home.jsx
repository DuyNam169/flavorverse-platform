import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Clock, Globe, Leaf, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { RecipeCard } from '../components/recipe/RecipeCard.jsx'
import { Badge, Button } from '../components/common/index.jsx'
import { useRecipeStore, useAuthStore } from '../store/index.js'

const FILTERS = [
  { id: 'all', label: '✨ Tất cả' },
  { id: 'VN', label: '🇻🇳 Việt Nam' },
  { id: 'JP', label: '🇯🇵 Nhật Bản' },
  { id: 'KR', label: '🇰🇷 Hàn Quốc' },
  { id: 'TH', label: '🇹🇭 Thái Lan' },
  { id: 'IT', label: '🇮🇹 Ý' },
]

const DIFF_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'easy', label: '🟢 Dễ' },
  { id: 'medium', label: '🟡 Vừa' },
  { id: 'hard', label: '🔴 Khó' },
]

export default function Home() {
  const { recipes } = useRecipeStore()
  const { user } = useAuthStore()
  const [country, setCountry] = useState('all')
  const [diff, setDiff] = useState('all')

  const filtered = recipes.filter(r =>
    (country === 'all' || r.country_code === country) &&
    (diff === 'all' || r.difficulty === diff)
  )

  const trending = [...recipes].sort((a, b) => b.fork_count - a.fork_count).slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-primary via-orange-400 to-secondary p-8 text-white">
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-semibold mb-1">Xin chào, {user?.display_name}! 👋</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-tight">
            Hôm nay bạn muốn<br />nấu món gì?
          </h1>
          <p className="text-orange-100 mb-5">Khám phá hàng nghìn công thức từ khắp thế giới</p>
          <Link to="/recipe/create">
            <Button className="bg-white text-primary hover:bg-orange-50 !text-primary font-bold shadow-lg">
              <Plus size={18} /> Tạo công thức mới
            </Button>
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute right-24 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-30">🍜</span>
      </div>

      {/* Trending section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Flame size={20} className="text-primary" /> Trending tuần này
          </h2>
          <Link to="/discover" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Xem thêm <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trending.map((r, i) => (
            <Link key={r.id} to={`/recipe/${r.id}`} className="card overflow-hidden group">
              <div className="relative">
                <img src={r.thumbnail_url} alt={r.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <div className="p-2.5">
                <p className="font-display font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                <p className="text-xs text-gray-400 mt-1">⭐ {r.avg_rating} · 🔀 {r.fork_count} fork</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI suggestion banner */}
      <div className="card mb-6 p-4 flex items-center gap-4 border border-orange-100 bg-gradient-to-r from-orange-50 to-white">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Sparkles size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">AI gợi ý thực đơn cho bạn</p>
          <p className="text-xs text-gray-500">Dựa trên vị trí Hà Nội, thời tiết hôm nay 28°C ☀️</p>
        </div>
        <Link to="/planner">
          <Button size="sm">Xem ngay</Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setCountry(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${country === f.id ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary hover:text-primary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {DIFF_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setDiff(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${diff === f.id ? 'bg-textMain text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} công thức</span>
        </div>
      </div>

      {/* Masonry feed */}
      <div className="masonry-grid">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-display text-xl font-bold mb-2">Không tìm thấy công thức</p>
          <p className="text-gray-500">Thử bộ lọc khác nhé!</p>
        </div>
      )}
    </div>
  )
}

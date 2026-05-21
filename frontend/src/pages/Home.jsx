import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Clock, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { RecipeCard } from '../components/recipe/RecipeCard.jsx'
import { useAuthStore } from '../store/index.js'
import { recipeApi } from '../api/index.js'
import toast from 'react-hot-toast'

const FILTERS = [
  { id: 'all', label: '✨ Tất cả' },
  { id: 'VN',  label: '🇻🇳 Việt Nam' },
  { id: 'JP',  label: '🇯🇵 Nhật Bản' },
  { id: 'KR',  label: '🇰🇷 Hàn Quốc' },
  { id: 'TH',  label: '🇹🇭 Thái Lan' },
  { id: 'IT',  label: '🇮🇹 Ý' },
]

const DIFF_FILTERS = [
  { id: 'all',    label: 'Tất cả' },
  { id: 'easy',   label: '🟢 Dễ' },
  { id: 'medium', label: '🟡 Vừa' },
  { id: 'hard',   label: '🔴 Khó' },
]

export default function Home() {
  const { user } = useAuthStore()
  const [recipes, setRecipes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [country, setCountry]   = useState('all')
  const [diff, setDiff]         = useState('all')

  useEffect(() => {
    recipeApi.getAll({ page: 0, size: 30 })
      .then(res => setRecipes(res.data.data?.content || res.data.data || []))
      .catch(() => toast.error('Không thể tải công thức'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = recipes.filter(r =>
    (country === 'all' || r.countryCode === country) &&
    (diff === 'all' || r.difficulty === diff)
  )

  const trending = [...recipes]
    .sort((a, b) => (b.forkCount ?? 0) - (a.forkCount ?? 0))
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-[#E8603C] via-orange-400 to-[#C0392B] p-8 text-white">
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-semibold mb-1">
            Xin chào, {user?.displayName || user?.username}! 👋
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-tight">
            Hôm nay bạn muốn<br />nấu món gì?
          </h1>
          <p className="text-orange-100 mb-5">Khám phá hàng nghìn công thức từ khắp thế giới</p>
          <Link to="/recipe/create">
            <button className="flex items-center gap-2 bg-white text-[#E8603C] font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-orange-50 transition-colors">
              <Plus size={18} /> Tạo công thức mới
            </button>
          </Link>
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute right-24 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-30">🍜</span>
      </div>

      {/* Trending */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Flame size={20} className="text-[#E8603C]" /> Trending tuần này
          </h2>
          <Link to="/discover" className="text-sm text-[#E8603C] font-semibold flex items-center gap-1 hover:underline">
            Xem thêm <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.map((r, i) => (
              <Link key={r.id} to={`/recipe/${String(r.id).trim()}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={r.thumbnailUrl} alt={r.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 w-6 h-6 bg-[#E8603C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#E8603C] transition-colors">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-1">⭐ {r.avgRating?.toFixed(1) ?? '0'} · 🔀 {r.forkCount ?? 0} fork</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* AI suggestion banner */}
      <div className="bg-white border border-orange-100 rounded-2xl mb-6 p-4 flex items-center gap-4 bg-gradient-to-r from-orange-50 to-white shadow-sm">
        <div className="w-12 h-12 bg-[#E8603C]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Sparkles size={24} className="text-[#E8603C]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">AI gợi ý thực đơn cho bạn</p>
          <p className="text-xs text-gray-500">Dựa trên sở thích và mục tiêu dinh dưỡng của bạn</p>
        </div>
        <Link to="/planner">
          <button className="bg-[#E8603C] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d4522f] transition-colors">
            Xem ngay
          </button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setCountry(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                country === f.id
                  ? 'bg-[#E8603C] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#E8603C] hover:text-[#E8603C]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {DIFF_FILTERS.map(f => (
            <button key={f.id} onClick={() => setDiff(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                diff === f.id ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} công thức</span>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="masonry-grid">
          {filtered.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-xl font-bold mb-2">Không tìm thấy công thức</p>
          <p className="text-gray-500">Thử bộ lọc khác nhé!</p>
        </div>
      )}
    </div>
  )
}
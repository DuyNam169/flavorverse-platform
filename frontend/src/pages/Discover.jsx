import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Cloud, TrendingUp, Globe } from 'lucide-react'
import { RecipeCard } from '../components/recipe/RecipeCard.jsx'
import { useRecipeStore } from '../store/index.js'

const WORLD_SECTIONS = [
  { flag: '🇻🇳', country: 'VN', label: 'Việt Nam', desc: 'Hương vị quê hương' },
  { flag: '🇯🇵', country: 'JP', label: 'Nhật Bản', desc: 'Tinh tế, nhẹ nhàng' },
  { flag: '🇰🇷', country: 'KR', label: 'Hàn Quốc', desc: 'Đậm đà, cay nồng' },
  { flag: '🇹🇭', country: 'TH', label: 'Thái Lan', desc: 'Chua cay hấp dẫn' },
  { flag: '🇮🇹', country: 'IT', label: 'Nước Ý', desc: 'Pasta & Pizza' },
  { flag: '🇲🇽', country: 'MX', label: 'Mexico', desc: 'Sống động, phong phú' },
]

const AI_WORLD_SUGGESTIONS = [
  { id: '13', title: 'Shakshuka', country: '🇮🇱', desc: 'Trứng hầm cà chua kiểu Trung Đông', calories: 320, emoji: '🍳', badge: '🌍 Khám phá mới' },
  { id: '14', title: 'Injera & Doro Wat', country: '🇪🇹', desc: 'Bánh mì xốp Ethiopia với gà hầm gia vị', calories: 450, emoji: '🍞', badge: '🌍 Khám phá mới' },
  { id: '15', title: 'Pho Cuốn Fusion', country: '🌏', desc: 'Phở cuộn kiểu hiện đại, giao thoa văn hóa', calories: 380, emoji: '🫔', badge: '✨ AI Pick' },
]

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { recipes } = useRecipeStore()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchParams({ q: query })
    else setSearchParams({})
  }

  const displayRecipes = recipes.filter(r => {
    const matchQ = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
    const matchCountry = !selectedCountry || r.country_code === selectedCountry
    return matchQ && matchCountry
  })

  const nearYou = recipes.filter(r => r.country_code === 'VN')
  const hotWeather = recipes.filter(r => r.tags?.some(t => ['Canh', 'Soup', 'Thanh mát'].includes(t)) || r.season?.includes('summer')).slice(0, 4)
  const trending = [...recipes].sort((a, b) => b.save_count - a.save_count).slice(0, 4)

  const showSections = !query && !selectedCountry

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold mb-4">Khám phá ẩm thực</h1>
        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên món, nguyên liệu, tag..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3.5 bg-white rounded-2xl border border-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryDark transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {showSections ? (
        <>
          {/* Section: Near you */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-primary" /> Gần bạn — Ẩm thực Việt
            </h2>
            <div className="masonry-grid">
              {nearYou.slice(0, 6).map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>

          {/* Section: Weather */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-1">
              <Cloud size={18} className="text-blue-400" /> Theo thời tiết hôm nay ☀️ 28°C
            </h2>
            <p className="text-sm text-gray-500 mb-4">Hà Nội, trời nắng — gợi ý món mát, thanh nhẹ</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {hotWeather.map(r => (
                <RecipeCard key={r.id} recipe={r} compact />
              ))}
            </div>
          </section>

          {/* Section: AI World dishes */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-primary" />
              <div>
                <h2 className="font-display text-lg font-bold">🌍 Khám phá ẩm thực thế giới</h2>
                <p className="text-xs text-gray-500">AI gợi ý những món lạ, bạn chưa thử bao giờ</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {AI_WORLD_SUGGESTIONS.map(item => (
                <div key={item.id} className="card p-4 border border-orange-100 hover:border-primary transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-xs bg-primaryLight text-primary font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>
                  </div>
                  <h3 className="font-display font-bold text-base mb-1 group-hover:text-primary transition-colors">{item.country} {item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                  <p className="text-xs text-gray-400">🔥 {item.calories} kcal/khẩu phần</p>
                </div>
              ))}
            </div>
          </section>

          {/* Country explorer */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-4">🗺️ Khám phá theo quốc gia</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {WORLD_SECTIONS.map(s => (
                <button
                  key={s.country}
                  onClick={() => setSelectedCountry(s.country)}
                  className="card p-3 text-center hover:border-primary border border-transparent transition-all group"
                >
                  <div className="text-3xl mb-1">{s.flag}</div>
                  <p className="font-semibold text-xs group-hover:text-primary">{s.label}</p>
                  <p className="text-xs text-gray-400 hidden md:block">{s.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Trending */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" /> Trending tuần này
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trending.map(r => <RecipeCard key={r.id} recipe={r} compact />)}
            </div>
          </section>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">
              {selectedCountry
                ? `${WORLD_SECTIONS.find(s => s.country === selectedCountry)?.flag} Món ăn ${WORLD_SECTIONS.find(s => s.country === selectedCountry)?.label}`
                : `Kết quả cho "${query}"`
              }
            </h2>
            <button onClick={() => { setSelectedCountry(null); setQuery(''); setSearchParams({}) }} className="text-sm text-primary hover:underline">
              ← Quay lại
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{displayRecipes.length} công thức</p>
          {displayRecipes.length > 0 ? (
            <div className="masonry-grid">
              {displayRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">😕</p>
              <p className="font-display text-xl font-bold mb-2">Không tìm thấy kết quả</p>
              <p className="text-gray-500">Thử từ khóa khác nhé!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

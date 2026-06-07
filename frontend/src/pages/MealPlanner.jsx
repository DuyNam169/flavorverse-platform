import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShoppingCart, X, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button, Avatar } from '../components/common/index.jsx'
import { usePlannerStore, useRecipeStore } from '../store/index.js'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const MEAL_TYPES = [
  { key: 'breakfast', label: '🌅 Sáng', color: 'from-yellow-50 to-white' },
  { key: 'lunch', label: '☀️ Trưa', color: 'from-orange-50 to-white' },
  { key: 'dinner', label: '🌙 Tối', color: 'from-blue-50 to-white' },
]

function CalorieChart({ mealPlan }) {
  const dailyCals = DAYS.map((_, dayIdx) => {
    const meals = mealPlan[dayIdx] || {}
    return Object.values(meals).reduce((sum, r) => sum + (r?.calories_per_serving || 0), 0)
  })
  const maxCal = Math.max(...dailyCals, 1)
  return (
    <div>
      <p className="text-sm font-semibold mb-3">📊 Calo theo ngày</p>
      <div className="flex items-end gap-1.5 h-20">
        {dailyCals.map((cal, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-primaryLight rounded-t-md transition-all duration-500" style={{ height: `${(cal / maxCal) * 60}px`, minHeight: cal > 0 ? 4 : 0 }} />
            <span className="text-xs text-gray-400">{DAYS[i].replace('Thứ ', 'T')}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Tổng tuần: {dailyCals.reduce((a, b) => a + b, 0)} kcal</span>
        <span>Mục tiêu: 14,000 kcal</span>
      </div>
    </div>
  )
}

export default function MealPlanner() {
  const { mealPlan, setMeal, clearMeal, shoppingList, toggleShoppingItem } = usePlannerStore()
  const { recipes } = useRecipeStore()
  const [tab, setTab] = useState('planner')
  const [addingSlot, setAddingSlot] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [expandedCats, setExpandedCats] = useState({})

  const handleAiGenerate = () => {
    setAiLoading(true)
    setTimeout(() => setAiLoading(false), 2500)
  }

  const totalChecked = shoppingList.flatMap(c => c.items).filter(i => i.checked).length
  const totalItems = shoppingList.flatMap(c => c.items).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Thực đơn tuần</h1>
          <p className="text-sm text-gray-500">12–18 tháng 5, 2025</p>
        </div>
        <Button onClick={handleAiGenerate} loading={aiLoading} className="shadow-md">
          <Sparkles size={16} /> AI Gợi ý cả tuần
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[['planner', '📅 Thực đơn'], ['shopping', `🛒 Mua sắm (${totalChecked}/${totalItems})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === key ? 'bg-primary text-white shadow' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'planner' && (
        <div className="flex gap-5">
          {/* Planner grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header */}
              <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                <div />
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
                ))}
              </div>

              {/* Rows */}
              {MEAL_TYPES.map(({ key, label, color }) => (
                <div key={key} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                  <div className="flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-500 text-center leading-tight">{label}</span>
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const recipe = mealPlan[dayIdx]?.[key]
                    return (
                      <div key={dayIdx} className={`rounded-xl border border-gray-100 bg-gradient-to-b ${color} min-h-[80px] p-1.5 relative group`}>
                        {recipe ? (
                          <div className="h-full">
                            <Link to={`/recipe/${String(recipe.id).trim()}`}>
                              <img src={recipe.thumbnail_url} alt={recipe.title} className="w-full h-10 object-cover rounded-lg mb-1" />
                              <p className="text-xs font-semibold leading-tight line-clamp-2 hover:text-primary">{recipe.title}</p>
                              <p className="text-xs text-gray-400">{recipe.calories_per_serving} kcal</p>
                            </Link>
                            <button onClick={() => clearMeal(dayIdx, key)}
                              className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} className="text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setAddingSlot({ day: dayIdx, meal: key })}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-primary hover:bg-primaryLight rounded-lg transition-colors">
                            <Plus size={18} />
                            <span className="text-xs">Thêm</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="card p-4">
              <CalorieChart mealPlan={mealPlan} />
            </div>
            <div className="card p-4">
              <p className="text-sm font-semibold mb-2">💡 Mẹo AI</p>
              <p className="text-xs text-gray-500">Thời tiết Hà Nội hôm nay nắng, 28°C. Nên ưu tiên món canh thanh, tránh đồ chiên rán nhiều dầu.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'shopping' && (
        <div className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{totalChecked}/{totalItems} mặt hàng đã mua</p>
            <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(totalChecked / totalItems) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            {shoppingList.map((cat, catIdx) => {
              const expanded = expandedCats[catIdx] !== false
              const catChecked = cat.items.filter(i => i.checked).length
              return (
                <div key={catIdx} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedCats(prev => ({ ...prev, [catIdx]: !expanded }))}
                    className="w-full flex items-center justify-between p-4 font-semibold text-sm hover:bg-gray-50"
                  >
                    <span>{cat.category} <span className="text-gray-400 font-normal">({catChecked}/{cat.items.length})</span></span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expanded && (
                    <div className="border-t divide-y divide-gray-50">
                      {cat.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          onClick={() => toggleShoppingItem(catIdx, itemIdx)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-accent border-accent' : 'border-gray-300'}`}>
                            {item.checked && <Check size={12} className="text-white" />}
                          </div>
                          <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : ''}`}>{item.name}</span>
                          <span className="text-xs text-gray-400">{item.amount}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add meal modal */}
      {addingSlot && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddingSlot(null)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Chọn công thức</h3>
              <button onClick={() => setAddingSlot(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="p-4 space-y-2">
              {recipes.map(r => (
                <button key={r.id} onClick={() => { setMeal(addingSlot.day, addingSlot.meal, r); setAddingSlot(null) }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-background text-left transition-colors">
                  <img src={r.thumbnail_url} alt={r.title} className="w-14 h-12 object-cover rounded-xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.calories_per_serving} kcal · {r.cook_time_minutes}p</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

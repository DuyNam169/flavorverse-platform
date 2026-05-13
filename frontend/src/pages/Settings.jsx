import React, { useState } from 'react'
import { ArrowLeft, Save, MapPin, Heart, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/index.jsx'
import { useAuthStore } from '../store/index.js'
import toast from 'react-hot-toast'

const DIET_OPTIONS = [
  { value: 'normal', label: '🍽️ Ăn bình thường' },
  { value: 'vegetarian', label: '🥗 Chay (có trứng/sữa)' },
  { value: 'vegan', label: '🌱 Thuần chay' },
  { value: 'keto', label: '🥑 Keto' },
]

const ALLERGY_OPTIONS = ['Gluten', 'Sữa', 'Trứng', 'Đậu phộng', 'Hải sản', 'Đậu nành', 'Hạt cây']

export default function Settings() {
  const navigate = useNavigate()
  const { user, login } = useAuthStore()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    calorie_goal: user?.calorie_goal || 2000,
    diet_type: user?.diet_type || 'normal',
    allergies: user?.allergies || [],
  })
  const [saving, setSaving] = useState(false)

  const toggleAllergy = (a) => {
    setForm(f => ({
      ...f,
      allergies: f.allergies.includes(a) ? f.allergies.filter(x => x !== a) : [...f.allergies, a]
    }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      login({ ...user, ...form })
      setSaving(false)
      toast.success('Đã lưu cài đặt!')
    }, 1000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-xl font-bold">Cài đặt</h1>
      </div>

      {/* Section: Profile */}
      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">👤 Thông tin cá nhân</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tên hiển thị</label>
            <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Giới thiệu bản thân</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Vị trí địa lý</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="VD: Hà Nội, Việt Nam" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </section>

      {/* Section: Health goals */}
      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart size={16} className="text-primary" /> Mục tiêu sức khỏe</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mục tiêu calo/ngày</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1200} max={4000} step={50} value={form.calorie_goal}
                onChange={e => setForm({ ...form, calorie_goal: Number(e.target.value) })}
                className="flex-1 accent-primary" />
              <span className="font-bold text-primary w-20 text-right">{form.calorie_goal} kcal</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1,200</span><span>4,000</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Chế độ ăn</label>
            <div className="grid grid-cols-2 gap-2">
              {DIET_OPTIONS.map(o => (
                <label key={o.value} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${form.diet_type === o.value ? 'border-primary bg-primaryLight' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="diet" value={o.value} checked={form.diet_type === o.value} onChange={() => setForm({ ...form, diet_type: o.value })} className="accent-primary" />
                  <span className="text-xs font-semibold">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Allergies */}
      <section className="card p-5 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-yellow-500" /> Dị ứng & Kiêng kỵ</h2>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map(a => (
            <button key={a} onClick={() => toggleAllergy(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.allergies.includes(a) ? 'bg-red-100 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {form.allergies.includes(a) ? '⚠️ ' : ''}{a}
            </button>
          ))}
        </div>
      </section>

      <Button onClick={handleSave} loading={saving} className="w-full">
        <Save size={16} /> Lưu thay đổi
      </Button>
    </div>
  )
}

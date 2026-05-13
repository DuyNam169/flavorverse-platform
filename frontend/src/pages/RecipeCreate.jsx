import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Sparkles, ArrowLeft, ArrowRight, Check, Upload, GripVertical } from 'lucide-react'
import { Button, Badge } from '../components/common/index.jsx'
import { useRecipeStore } from '../store/index.js'

const STEPS = ['Cơ bản', 'Nguyên liệu', 'Cách làm', 'Dinh dưỡng', 'Hoàn thiện']

const COUNTRIES = [
  { code: 'VN', label: '🇻🇳 Việt Nam' }, { code: 'JP', label: '🇯🇵 Nhật Bản' },
  { code: 'KR', label: '🇰🇷 Hàn Quốc' }, { code: 'TH', label: '🇹🇭 Thái Lan' },
  { code: 'IT', label: '🇮🇹 Ý' }, { code: 'CN', label: '🇨🇳 Trung Quốc' },
  { code: 'MX', label: '🇲🇽 Mexico' }, { code: 'FR', label: '🇫🇷 Pháp' },
]

function StepBasic({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Tên món ăn *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="VD: Phở Bò Hà Nội" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Mô tả</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Giới thiệu ngắn về món ăn..." rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-semibold mb-1">Ảnh đại diện</label>
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary hover:bg-primaryLight/30 transition-colors cursor-pointer">
          <Upload size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Click để tải ảnh lên</p>
          <p className="text-xs text-gray-300">PNG, JPG, WEBP – tối đa 10MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Thời gian chuẩn bị (phút)</label>
          <input type="number" value={form.prep_time} onChange={e => setForm({ ...form, prep_time: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Thời gian nấu (phút)</label>
          <input type="number" value={form.cook_time} onChange={e => setForm({ ...form, cook_time: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Khẩu phần</label>
          <input type="number" value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Độ khó</label>
          <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white">
            <option value="easy">🟢 Dễ</option>
            <option value="medium">🟡 Vừa</option>
            <option value="hard">🔴 Khó</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Xuất xứ</label>
        <div className="grid grid-cols-4 gap-2">
          {COUNTRIES.map(c => (
            <button key={c.code} type="button"
              onClick={() => setForm({ ...form, country_code: c.code })}
              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${form.country_code === c.code ? 'border-primary bg-primaryLight text-primary' : 'border-gray-200 hover:border-primary'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepIngredients({ ingredients, setIngredients }) {
  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', unit: 'g', note: '', optional: false }])
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i))
  const updateIngredient = (i, field, value) => {
    const updated = [...ingredients]
    updated[i] = { ...updated[i], [field]: value }
    setIngredients(updated)
  }
  const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'cái', 'bó', 'nhánh', 'củ', 'trái']

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Kéo để sắp xếp thứ tự nguyên liệu</p>
      {ingredients.map((ing, i) => (
        <div key={i} className="flex items-center gap-2 bg-background rounded-xl p-3">
          <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />
          <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)}
            placeholder="Tên nguyên liệu" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <input type="number" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)}
            placeholder="100" className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none">
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
          <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button onClick={addIngredient}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Thêm nguyên liệu
      </button>
    </div>
  )
}

function StepCookingSteps({ steps, setSteps }) {
  const addStep = () => setSteps([...steps, { title: '', description: '', timer: '' }])
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i, field, value) => {
    const updated = [...steps]
    updated[i] = { ...updated[i], [field]: value }
    setSteps(updated)
  }
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="card p-4 border-l-4 border-primaryLight">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</div>
            <input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)}
              placeholder="Tên bước (VD: Luộc xương)" className="flex-1 bg-background rounded-lg px-3 py-1.5 text-sm border border-gray-100 focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
          </div>
          <textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)}
            placeholder="Mô tả chi tiết cách thực hiện bước này..."
            rows={3} className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 mb-2" />
          <div className="flex items-center gap-2">
            <input type="number" value={step.timer} onChange={e => updateStep(i, 'timer', e.target.value)}
              placeholder="Thời gian (giây)" className="w-36 bg-background border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
            <span className="text-xs text-gray-400">giây (để trống nếu không cần hẹn giờ)</span>
          </div>
        </div>
      ))}
      <button onClick={addStep}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Thêm bước
      </button>
    </div>
  )
}

function StepNutrition({ nutrition, setNutrition }) {
  const [aiLoading, setAiLoading] = useState(false)
  const handleAiFill = () => {
    setAiLoading(true)
    setTimeout(() => {
      setNutrition({ calories: 420, protein: 32, carbs: 48, fat: 12, fiber: 4, sugar: 6 })
      setAiLoading(false)
    }, 1800)
  }
  const fields = [
    { key: 'calories', label: 'Calo', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Chất béo', unit: 'g' },
    { key: 'fiber', label: 'Chất xơ', unit: 'g' },
    { key: 'sugar', label: 'Đường', unit: 'g' },
  ]
  return (
    <div>
      <div className="card p-4 mb-5 border border-primary/20 bg-gradient-to-br from-orange-50 to-white">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">AI tự động điền dinh dưỡng</p>
            <p className="text-xs text-gray-500 mb-3">AI sẽ phân tích nguyên liệu bạn đã nhập và ước tính thông tin dinh dưỡng.</p>
            <Button size="sm" loading={aiLoading} onClick={handleAiFill}>
              <Sparkles size={14} /> {aiLoading ? 'Đang phân tích...' : 'AI tự điền'}
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold mb-1 text-gray-600">{f.label} ({f.unit})</label>
            <input type="number" value={nutrition[f.key] || ''}
              onChange={e => setNutrition({ ...nutrition, [f.key]: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StepFinalize({ form, setForm }) {
  const [tag, setTag] = useState('')
  const addTag = () => { if (tag.trim() && !form.tags.includes(tag.trim())) { setForm({ ...form, tags: [...form.tags, tag.trim()] }); setTag('') } }
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input value={tag} onChange={e => setTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Thêm tag, ấn Enter" className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Button size="sm" onClick={addTag}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map(t => (
            <button key={t} onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })}
              className="text-xs px-3 py-1 bg-primaryLight text-primary rounded-full font-semibold flex items-center gap-1 hover:bg-red-100 hover:text-red-500 transition-colors">
              {t} ✕
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Cài đặt công khai</label>
        <div className="space-y-2">
          {[['public', '🌐 Công khai — Mọi người đều xem được'], ['private', '🔒 Riêng tư — Chỉ mình tôi']].map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-background transition-colors">
              <input type="radio" name="visibility" value={val} checked={form.visibility === val} onChange={() => setForm({ ...form, visibility: val })} className="accent-primary" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Khuyến cáo sức khỏe (tuỳ chọn)</label>
        <textarea placeholder="VD: Không phù hợp cho người dị ứng gluten..." rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
    </div>
  )
}

export default function RecipeCreate() {
  const navigate = useNavigate()
  const { addRecipe } = useRecipeStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', prep_time: 15, cook_time: 30, servings: 4, difficulty: 'medium', country_code: 'VN', tags: [], visibility: 'public' })
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: 'g', note: '' }])
  const [steps, setSteps] = useState([{ title: '', description: '', timer: '' }])
  const [nutrition, setNutrition] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      const newRecipe = {
        id: Date.now().toString(), ...form,
        prep_time_minutes: form.prep_time, cook_time_minutes: form.cook_time,
        thumbnail_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        avg_rating: 0, rating_count: 0, fork_count: 0, save_count: 0,
        calories_per_serving: nutrition.calories || 0, ...nutrition,
        author: { id: 'me', username: 'foodlover_vn', display_name: 'Bạn Yêu Bếp', avatar_url: 'https://i.pravatar.cc/40?img=20' },
        season: ['all'], is_public: form.visibility === 'public',
      }
      addRecipe(newRecipe)
      navigate(`/recipe/${newRecipe.id}`)
    }, 1500)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Tạo công thức mới</h1>
          <p className="text-xs text-gray-500">Bước {step + 1} / {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      {/* Step title */}
      <h2 className="font-display text-lg font-bold mb-4">{STEPS[step]}</h2>

      {/* Content */}
      <div className="mb-8">
        {step === 0 && <StepBasic form={form} setForm={setForm} />}
        {step === 1 && <StepIngredients ingredients={ingredients} setIngredients={setIngredients} />}
        {step === 2 && <StepCookingSteps steps={steps} setSteps={setSteps} />}
        {step === 3 && <StepNutrition nutrition={nutrition} setNutrition={setNutrition} />}
        {step === 4 && <StepFinalize form={form} setForm={setForm} />}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1" disabled={step === 0 && !form.title}>
            Tiếp theo <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} className="flex-1">
            <Check size={16} /> Đăng công thức
          </Button>
        )}
      </div>
    </div>
  )
}

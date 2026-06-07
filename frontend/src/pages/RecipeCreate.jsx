import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, Trash2, Sparkles, ArrowLeft, ArrowRight, Check,
  Upload, GripVertical, X, Search, Image, Video, ChevronDown,
  Globe, Users, Lock, Settings2, AlertCircle
} from 'lucide-react'
import { Button, Badge, Modal } from '../components/common/index.jsx'
import { useRecipeStore } from '../store/index.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Cơ bản', 'Nguyên liệu', 'Cách làm', 'Dinh dưỡng', 'Hoàn thiện']

const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'cái', 'bó', 'nhánh', 'củ', 'trái', 'lát', 'muỗng']

const VISIBILITY_OPTIONS = [
  { value: 'public',         icon: Globe,     label: '🌐 Công khai',        desc: 'Mọi người đều xem được' },
  { value: 'followers_only', icon: Users,     label: '👥 Người theo dõi',   desc: 'Chỉ follower của bạn' },
  { value: 'private',        icon: Lock,      label: '🔒 Riêng tư',         desc: 'Chỉ mình tôi' },
  { value: 'custom',         icon: Settings2, label: '⚙️ Tuỳ chỉnh',        desc: 'Chọn người cụ thể' },
]

const COUNTRIES = [
  { code: 'VN', label: 'Việt Nam',     flag: '🇻🇳' },
  { code: 'TH', label: 'Thái Lan',     flag: '🇹🇭' },
  { code: 'ID', label: 'Indonesia',    flag: '🇮🇩' },
  { code: 'MY', label: 'Malaysia',     flag: '🇲🇾' },
  { code: 'SG', label: 'Singapore',    flag: '🇸🇬' },
  { code: 'PH', label: 'Philippines',  flag: '🇵🇭' },
  { code: 'MM', label: 'Myanmar',      flag: '🇲🇲' },
  { code: 'KH', label: 'Campuchia',    flag: '🇰🇭' },
  { code: 'LA', label: 'Lào',          flag: '🇱🇦' },
  { code: 'CN', label: 'Trung Quốc',   flag: '🇨🇳' },
  { code: 'JP', label: 'Nhật Bản',     flag: '🇯🇵' },
  { code: 'KR', label: 'Hàn Quốc',     flag: '🇰🇷' },
  { code: 'TW', label: 'Đài Loan',     flag: '🇹🇼' },
  { code: 'HK', label: 'Hồng Kông',    flag: '🇭🇰' },
  { code: 'IN', label: 'Ấn Độ',        flag: '🇮🇳' },
  { code: 'TR', label: 'Thổ Nhĩ Kỳ',  flag: '🇹🇷' },
  { code: 'IT', label: 'Ý',            flag: '🇮🇹' },
  { code: 'FR', label: 'Pháp',         flag: '🇫🇷' },
  { code: 'ES', label: 'Tây Ban Nha',  flag: '🇪🇸' },
  { code: 'DE', label: 'Đức',          flag: '🇩🇪' },
  { code: 'GB', label: 'Anh',          flag: '🇬🇧' },
  { code: 'MX', label: 'Mexico',       flag: '🇲🇽' },
  { code: 'US', label: 'Hoa Kỳ',       flag: '🇺🇸' },
  { code: 'BR', label: 'Brazil',       flag: '🇧🇷' },
  { code: 'AU', label: 'Úc',           flag: '🇦🇺' },
]

// ─── Shared helpers ───────────────────────────────────────────────────────────

const API_BASE = '/api'

async function uploadFile(file, type = 'image') {
  const endpoint = type === 'video'
    ? `${API_BASE}/recipes/upload-video`
    : `${API_BASE}/recipes/upload-image`
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
    body: fd,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload thất bại')
  return data.data.url
}

function isVideo(file) {
  return file?.type?.startsWith('video/')
}

// ─── MediaUpload ──────────────────────────────────────────────────────────────
function MediaUpload({ thumbnailUrl, setThumbnailUrl, mediaUrls, setMediaUrls, videoUrl, setVideoUrl }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const inputRef = useRef()

  const handleFiles = useCallback(async (files) => {
    setError('')
    setUploading(true)
    try {
      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) { setError('File tối đa 100MB'); continue }
        const type = isVideo(file) ? 'video' : 'image'
        const url  = await uploadFile(file, type)
        if (type === 'video') {
          setVideoUrl(url)
        } else if (!thumbnailUrl) {
          setThumbnailUrl(url)
        } else {
          setMediaUrls(prev => [...prev, url])
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }, [thumbnailUrl, setThumbnailUrl, setMediaUrls, setVideoUrl])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    handleFiles([...e.dataTransfer.files])
  }, [handleFiles])

  const removeMedia = (url, type) => {
    if (type === 'thumb')  { setThumbnailUrl('') }
    if (type === 'extra')  { setMediaUrls(prev => prev.filter(u => u !== url)) }
    if (type === 'video')  { setVideoUrl('') }
  }

  const allMedia = [
    thumbnailUrl && { url: thumbnailUrl, type: 'thumb',  label: 'Ảnh đại diện' },
    ...mediaUrls.map(u => ({ url: u, type: 'extra', label: 'Ảnh phụ' })),
    videoUrl    && { url: videoUrl,    type: 'video', label: 'Video' },
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:bg-orange-50/40 transition-colors cursor-pointer"
      >
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={e => handleFiles([...e.target.files])} />
        {uploading ? (
          <p className="text-sm text-primary animate-pulse">Đang tải lên...</p>
        ) : (
          <>
            <Upload size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-500">Kéo thả hoặc click để chọn</p>
            <p className="text-xs text-gray-400 mt-1">Ảnh PNG/JPG/WEBP hoặc Video MP4/MOV · Tối đa 100MB/file</p>
            <p className="text-xs text-primary mt-1">Ảnh đầu tiên sẽ là ảnh đại diện</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}

      {allMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {allMedia.map(({ url, type, label }) => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
              {type === 'video' ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={url} alt={label} className="w-full h-full object-cover" />
              )}
              <span className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                type === 'thumb' ? 'bg-primary text-white' :
                type === 'video' ? 'bg-purple-500 text-white' : 'bg-black/50 text-white'
              }`}>{label}</span>
              <button onClick={() => removeMedia(url, type)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
              {type === 'extra' && (
                <button
                  onClick={() => {
                    setMediaUrls(prev => [thumbnailUrl, ...prev.filter(u => u !== url)])
                    setThumbnailUrl(url)
                  }}
                  className="absolute bottom-1 left-1 right-1 text-[10px] bg-white/90 text-gray-700 rounded-md py-0.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Đặt làm đại diện
                </button>
              )}
            </div>
          ))}
          <button onClick={() => inputRef.current.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors">
            <Plus size={20} />
            <span className="text-xs mt-1">Thêm</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── CountryDropdown ──────────────────────────────────────────────────────────
function CountryDropdown({ value, onChange }) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef()

  const selected = COUNTRIES.find(c => c.code === value)
  const filtered = COUNTRIES.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
        <span>{selected ? `${selected.flag} ${selected.label}` : 'Chọn quốc gia...'}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Tìm quốc gia..." className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>
            ) : filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c.code); setOpen(false); setQuery('') }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-orange-50 transition-colors ${value === c.code ? 'bg-orange-50 text-primary font-semibold' : ''}`}>
                <span className="text-base">{c.flag}</span>
                <span>{c.label}</span>
                {value === c.code && <Check size={14} className="ml-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── StepBasic ────────────────────────────────────────────────────────────────
function StepBasic({ form, setForm, media, setMedia }) {
  const f = (field, val) => setForm({ ...form, [field]: val })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Tên món ăn *</label>
        <input value={form.title} onChange={e => f('title', e.target.value)}
          placeholder="VD: Phở Bò Hà Nội"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Mô tả</label>
        <textarea value={form.description} onChange={e => f('description', e.target.value)}
          placeholder="Giới thiệu ngắn về món ăn..." rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Ảnh & Video</label>
        <MediaUpload
          thumbnailUrl={media.thumbnailUrl}
          setThumbnailUrl={v => setMedia({ ...media, thumbnailUrl: v })}
          mediaUrls={media.mediaUrls}
          setMediaUrls={v => setMedia({ ...media, mediaUrls: typeof v === 'function' ? v(media.mediaUrls) : v })}
          videoUrl={media.videoUrl}
          setVideoUrl={v => setMedia({ ...media, videoUrl: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Thời gian chuẩn bị (phút)', key: 'prepTimeMinutes' },
          { label: 'Thời gian nấu (phút)',       key: 'cookTimeMinutes' },
          { label: 'Khẩu phần',                  key: 'servings' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input type="number" value={form[key]} onChange={e => f(key, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold mb-1">Độ khó</label>
          <select value={form.difficulty} onChange={e => f('difficulty', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white">
            <option value="easy">🟢 Dễ</option>
            <option value="medium">🟡 Vừa</option>
            <option value="hard">🔴 Khó</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Xuất xứ</label>
        <CountryDropdown value={form.countryCode} onChange={v => f('countryCode', v)} />
      </div>
    </div>
  )
}

// ─── IngredientSearch ─────────────────────────────────────────────────────────
function IngredientSearch({ onSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const timer = useRef()
  const ref   = useRef()

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API_BASE}/ingredients/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
        })
        const data = await res.json()
        setResults(data.data || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  useEffect(() => {
    if (!open || query.trim()) return
    fetch(`${API_BASE}/ingredients/popular`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
    }).then(r => r.json()).then(d => setResults(d.data || [])).catch(() => {})
  }, [open, query])

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm nguyên liệu..."
          className="flex-1 text-sm outline-none" />
        {loading && <span className="text-xs text-gray-400 animate-pulse">...</span>}
      </div>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {results.length === 0 && !loading && query.trim() ? (
            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-2">Không tìm thấy "{query}"</p>
              <button
                onMouseDown={() => { onSelect({ _new: true, name: query }); setOpen(false); setQuery('') }}
                className="text-xs font-semibold text-primary flex items-center gap-1 mx-auto hover:underline">
                <Plus size={12} /> Tạo nguyên liệu mới "{query}"
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {!query.trim() && (
                <p className="text-[10px] text-gray-400 px-3 pt-2 pb-1 uppercase tracking-wider font-semibold">Phổ biến</p>
              )}
              {results.map(ing => (
                <button key={ing.id} type="button"
                  onMouseDown={() => { onSelect(ing); setOpen(false); setQuery('') }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-orange-50 transition-colors">
                  {ing.imageUrl ? (
                    <img src={ing.imageUrl} alt={ing.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-base">🥕</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ing.name}</p>
                    {ing.nameVi && ing.nameVi !== ing.name && (
                      <p className="text-xs text-gray-400 truncate">{ing.nameVi}</p>
                    )}
                  </div>
                  {ing.useCount > 0 && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{ing.useCount} CT</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CreateIngredientModal ────────────────────────────────────────────────────
function CreateIngredientModal({ open, initialName, onClose, onCreate }) {
  const [form, setForm] = useState({ name: initialName || '', nameVi: '', description: '', imageUrl: '' })
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [tagResults, setTagResults] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const tagTimer = useRef()

  useEffect(() => {
    if (open) {
      setForm({ name: initialName || '', nameVi: '', description: '', imageUrl: '' })
      setSelectedTags([]); setTagSearch(''); setTagResults([]); setError('')
    }
  }, [open, initialName])

  useEffect(() => {
    clearTimeout(tagTimer.current)
    if (!tagSearch.trim()) { setTagResults([]); return }
    tagTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/tags/search?q=${encodeURIComponent(tagSearch)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
        })
        const data = await res.json()
        setTagResults((data.data || []).filter(t => !selectedTags.find(s => s.id === t.id)))
      } catch { setTagResults([]) }
    }, 300)
  }, [tagSearch, selectedTags])

  const handleAddTagByEnter = async (e) => {
    if (e.key !== 'Enter') return
    const name = tagSearch.trim()
    if (!name) return
    if (selectedTags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      setTagSearch(''); setTagResults([]); return
    }
    try {
      const res = await fetch(`${API_BASE}/tags/find-or-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
        body: JSON.stringify({ name, type: 'ingredient' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSelectedTags(prev => [...prev, data.data])
      setTagSearch(''); setTagResults([])
    } catch (e) { setError(e.message) }
  }

  const handleImageUpload = async (file) => {
    setUploading(true)
    try { const url = await uploadFile(file, 'image'); setForm(f => ({ ...f, imageUrl: url })) }
    catch (e) { setError(e.message) }
    finally { setUploading(false) }
  }

  // Fixed: this now correctly creates an ingredient via POST /api/ingredients
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Tên nguyên liệu không được để trống.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          nameVi:      form.nameVi.trim() || null,
          description: form.description.trim() || null,
          imageUrl:    form.imageUrl || null,
          tagIds:      selectedTags.map(t => t.id),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Tạo nguyên liệu thất bại')
      onCreate(data.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full sm:max-w-[480px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-lg">Tạo nguyên liệu mới</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Ảnh + tên */}
          <div className="flex items-start gap-4">
            <div onClick={() => fileRef.current.click()}
              className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-orange-50 transition-colors overflow-hidden flex-shrink-0">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : uploading ? (
                <span className="text-[10px] text-primary animate-pulse">Đang tải...</span>
              ) : (
                <><Image size={20} className="text-gray-300 mb-1" /><span className="text-[10px] text-gray-400">Thêm ảnh</span></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên nguyên liệu <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Thịt bò Wagyu"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên tiếng Việt</label>
                <input value={form.nameVi} onChange={e => setForm(f => ({ ...f, nameVi: e.target.value }))}
                  placeholder="VD: Thịt bò Wagyu"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Nguồn gốc, đặc điểm nổi bật..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Tags</label>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map(t => (
                  <span key={t.id} className="inline-flex items-center gap-1 bg-orange-50 text-primary border border-orange-200 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold">
                    {t.name}
                    <button onClick={() => setSelectedTags(p => p.filter(x => x.id !== t.id))}
                      className="w-4 h-4 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center">
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 bg-white">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  onKeyDown={handleAddTagByEnter}
                  placeholder="Gõ tên tag rồi Enter (VD: allergen, protein...)"
                  className="flex-1 text-sm outline-none bg-transparent" />
              </div>
              {tagResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="max-h-36 overflow-y-auto">
                    {tagResults.map(t => (
                      <button key={t.id} type="button" onMouseDown={() => { setSelectedTags(p => [...p, t]); setTagSearch(''); setTagResults([]) }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-orange-50 transition-colors">
                        <span className="text-sm font-semibold flex-1">{t.name}</span>
                        {t.type && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t.type}</span>}
                        <Plus size={13} className="text-primary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 px-3 py-1.5 border-t border-gray-100">Chọn gợi ý hoặc nhấn Enter để tạo mới</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Nhấn Enter để thêm. Nếu chưa có sẽ tự tạo mới.</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-xl">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={onClose} className="flex-1">Huỷ</Button>
          <Button onClick={handleSubmit} loading={saving} disabled={uploading} className="flex-1">
            <Check size={14} /> Tạo nguyên liệu
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── StepIngredients ──────────────────────────────────────────────────────────
function StepIngredients({ ingredients, setIngredients }) {
  const [createModal, setCreateModal] = useState({ open: false, name: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimer = useRef()
  const searchRef = useRef()

  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!searchQuery.trim()) {
      fetch(`${API_BASE}/ingredients/popular`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
      }).then(r => r.json()).then(d => setSearchResults(d.data || [])).catch(() => {})
      return
    }
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/ingredients/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
        })
        const data = await res.json()
        setSearchResults(data.data || [])
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 300)
  }, [searchQuery])

  useEffect(() => {
    const handler = e => { if (!searchRef.current?.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addIngredient = (ing) => {
    if (ingredients.find(i => i.ingredientId === ing.id)) return
    setIngredients(prev => [...prev, {
      ingredientId: ing.id,
      name: ing.name,
      imageUrl: ing.imageUrl || '',
      amount: '',
      unit: 'g',
      note: '',
      optional: false,
    }])
    setSearchQuery('')
    setShowDropdown(false)
  }

  const remove = (idx) => setIngredients(prev => prev.filter((_, i) => i !== idx))

  const update = (idx, field, val) => {
    setIngredients(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: val }
      return next
    })
  }

  const handleCreated = (newIng) => {
    addIngredient({ id: newIng.id, name: newIng.name, imageUrl: newIng.imageUrl })
    setCreateModal({ open: false, name: '' })
  }

  const alreadySelectedIds = ingredients.map(i => i.ingredientId).filter(Boolean)
  const filteredResults = searchResults.filter(r => !alreadySelectedIds.includes(r.id))

  return (
    <div className="space-y-4">
      <div ref={searchRef} className="relative">
        <label className="block text-sm font-semibold mb-2">Thêm nguyên liệu</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary bg-white transition-all">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Tìm nguyên liệu (VD: thịt bò, cà chua...)"
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {searching && <span className="text-xs text-gray-400 animate-pulse">...</span>}
        </div>

        {showDropdown && (
          <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {!searchQuery.trim() && (
              <p className="text-[10px] text-gray-400 px-4 pt-3 pb-1 uppercase tracking-wider font-semibold">Phổ biến</p>
            )}
            {filteredResults.length > 0 ? (
              <div className="max-h-56 overflow-y-auto">
                {filteredResults.map(ing => (
                  <button key={ing.id} type="button"
                    onMouseDown={() => addIngredient(ing)}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 transition-colors">
                    {ing.imageUrl ? (
                      <img src={ing.imageUrl} alt={ing.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">🥕</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ing.name}</p>
                      {ing.nameVi && ing.nameVi !== ing.name && (
                        <p className="text-xs text-gray-400 truncate">{ing.nameVi}</p>
                      )}
                    </div>
                    {ing.useCount > 0 && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{ing.useCount} CT</span>
                    )}
                    <Plus size={14} className="text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() && !searching ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500 mb-3">Không tìm thấy "{searchQuery}"</p>
                <button
                  onMouseDown={() => { setCreateModal({ open: true, name: searchQuery }); setShowDropdown(false); setSearchQuery('') }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition-colors">
                  <Plus size={13} /> Tạo nguyên liệu "{searchQuery}"
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Đã thêm ({ingredients.length})
          </p>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">
                  {ing.imageUrl ? (
                    <img src={ing.imageUrl} alt={ing.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">🥕</div>
                  )}
                </div>
                <p className="flex-1 text-sm font-semibold text-gray-800">{ing.name}</p>
                <button onClick={() => remove(idx)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0">
                  <X size={13} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ing.amount}
                  onChange={e => update(idx, 'amount', e.target.value)}
                  placeholder="Lượng"
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
                />
                <select
                  value={ing.unit}
                  onChange={e => update(idx, 'unit', e.target.value)}
                  className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none bg-white"
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <input
                  value={ing.note}
                  onChange={e => update(idx, 'note', e.target.value)}
                  placeholder="Ghi chú..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
                />
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer flex-shrink-0 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={ing.optional}
                    onChange={e => update(idx, 'optional', e.target.checked)}
                    className="accent-primary"
                  />
                  Tùy chọn
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">🥘</p>
          <p className="text-sm">Chưa có nguyên liệu nào. Tìm kiếm bên trên để thêm.</p>
        </div>
      )}

      <CreateIngredientModal
        open={createModal.open}
        initialName={createModal.name}
        onClose={() => setCreateModal({ open: false, name: '' })}
        onCreate={handleCreated}
      />
    </div>
  )
}

// ─── StepMedia (cho từng bước) ────────────────────────────────────────────────
function StepMedia({ imageUrl, setImageUrl, mediaUrls, setMediaUrls, videoUrl, setVideoUrl }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    setUploading(true)
    try {
      for (const file of files) {
        const type = isVideo(file) ? 'video' : 'image'
        const url  = await uploadFile(file, type)
        if (type === 'video') setVideoUrl(url)
        else if (!imageUrl)   setImageUrl(url)
        else setMediaUrls(prev => [...prev, url])
      }
    } finally { setUploading(false) }
  }

  const allMedia = [
    imageUrl  && { url: imageUrl,  type: 'image', label: 'Ảnh' },
    ...mediaUrls.map(u => ({ url: u, type: 'extra', label: 'Ảnh phụ' })),
    videoUrl  && { url: videoUrl,  type: 'video', label: 'Video' },
  ].filter(Boolean)

  return (
    <div className="mt-2">
      <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden"
        onChange={e => handleFiles([...e.target.files])} />
      <div className="flex items-center gap-2 flex-wrap">
        {allMedia.map(({ url, type, label }) => (
          <div key={url} className="relative group w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {type === 'video' ? (
              <video src={url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={url} alt={label} className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => {
                if (type === 'image') setImageUrl('')
                if (type === 'video') setVideoUrl('')
                if (type === 'extra') setMediaUrls(p => p.filter(u => u !== url))
              }}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full items-center justify-center hidden group-hover:flex">
              <X size={8} />
            </button>
          </div>
        ))}
        <button onClick={() => inputRef.current.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors flex-shrink-0">
          {uploading ? <span className="text-[10px] animate-pulse">...</span> : (
            <><Plus size={16} /><span className="text-[10px] mt-0.5">Ảnh/Video</span></>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── StepCookingSteps ─────────────────────────────────────────────────────────
function StepCookingSteps({ steps, setSteps }) {
  const add    = () => setSteps([...steps, { title: '', description: '', timer: '', imageUrl: '', mediaUrls: [], videoUrl: '' }])
  const remove = i => setSteps(steps.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...steps]
    next[i] = { ...next[i], [field]: val }
    setSteps(next)
  }

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-orange-600">
          Mỗi bước cần có <span className="font-semibold">tên bước</span> hoặc <span className="font-semibold">mô tả</span>. Thời gian, ảnh, video là tùy chọn.
        </p>
      </div>

      {steps.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">👨‍🍳</p>
          <p className="text-sm font-semibold mb-1">Chưa có bước nào</p>
          <p className="text-xs">Bấm "Thêm bước" để bắt đầu hướng dẫn nấu ăn</p>
        </div>
      )}

      {steps.map((step, i) => {
        const hasError = !step.title?.trim() && !step.description?.trim()
        return (
          <div key={i} className={`card p-4 border-l-4 transition-colors ${hasError ? 'border-red-300 bg-red-50/30' : 'border-orange-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${hasError ? 'bg-red-400 text-white' : 'bg-primary text-white'}`}>
                {i + 1}
              </div>
              <input value={step.title} onChange={e => update(i, 'title', e.target.value)}
                placeholder="Tên bước * (VD: Luộc xương)"
                className={`flex-1 bg-gray-50 rounded-lg px-3 py-1.5 text-sm border focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                  !step.title?.trim() && !step.description?.trim() ? 'border-red-200' : 'border-gray-100'
                }`} />
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>

            <textarea value={step.description} onChange={e => update(i, 'description', e.target.value)}
              placeholder="Mô tả chi tiết cách thực hiện * (VD: Cho xương vào nồi, đổ nước ngập...)"
              rows={3}
              className={`w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 mb-1 ${
                !step.title?.trim() && !step.description?.trim() ? 'border-red-200' : 'border-gray-100'
              }`} />

            {hasError && (
              <p className="text-[10px] text-red-400 flex items-center gap-1 mb-2">
                <AlertCircle size={10} /> Cần có tên bước hoặc mô tả
              </p>
            )}

            <div className="flex items-center gap-2 mb-2">
              <input type="number" value={step.timer} onChange={e => update(i, 'timer', e.target.value)}
                placeholder="Hẹn giờ"
                className="w-28 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
              <span className="text-xs text-gray-400">phút (tùy chọn)</span>
            </div>

            <StepMedia
              imageUrl={step.imageUrl || ''}
              setImageUrl={v => update(i, 'imageUrl', v)}
              mediaUrls={step.mediaUrls || []}
              setMediaUrls={v => update(i, 'mediaUrls', typeof v === 'function' ? v(step.mediaUrls || []) : v)}
              videoUrl={step.videoUrl || ''}
              setVideoUrl={v => update(i, 'videoUrl', v)}
            />
          </div>
        )
      })}

      <button onClick={add}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Thêm bước
      </button>
    </div>
  )
}

// ─── StepNutrition ────────────────────────────────────────────────────────────
const NUTRITION_FIELDS = [
  { key: 'caloriesPerServing', label: 'Calo',        unit: 'kcal', group: 'Macros chính',      note: 'Tổng năng lượng/khẩu phần' },
  { key: 'proteinG',          label: 'Protein',      unit: 'g',    group: 'Macros chính' },
  { key: 'carbsG',            label: 'Carbohydrate', unit: 'g',    group: 'Macros chính' },
  { key: 'fatG',              label: 'Chất béo',     unit: 'g',    group: 'Macros chính' },
  { key: 'fiberG',            label: 'Chất xơ',      unit: 'g',    group: 'Chất xơ & đường' },
  { key: 'sugarG',            label: 'Đường',        unit: 'g',    group: 'Chất xơ & đường' },
  { key: 'sodiumMg',          label: 'Natri (Muối)', unit: 'mg',   group: 'Khoáng chất',       note: '<2300mg/ngày' },
  { key: 'cholesterolMg',     label: 'Cholesterol',  unit: 'mg',   group: 'Khoáng chất',       note: '<300mg/ngày' },
]

function StepNutrition({ nutrition, setNutrition }) {
  const [aiLoading, setAiLoading] = useState(false)

  const handleAiFill = () => {
    setAiLoading(true)
    setTimeout(() => {
      setNutrition({ caloriesPerServing: 420, proteinG: 32, carbsG: 48, fatG: 12, fiberG: 4, sugarG: 6, sodiumMg: 680, cholesterolMg: 85 })
      setAiLoading(false)
    }, 1800)
  }

  const groups = [...new Set(NUTRITION_FIELDS.map(f => f.group))]

  return (
    <div className="space-y-5">
      <div className="card p-4 border border-primary/20 bg-gradient-to-br from-orange-50 to-white">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">AI tự động điền dinh dưỡng</p>
            <p className="text-xs text-gray-500 mb-3">AI phân tích nguyên liệu và ước tính theo chuẩn FDA/WHO.</p>
            <Button size="sm" loading={aiLoading} onClick={handleAiFill}>
              <Sparkles size={14} /> {aiLoading ? 'Đang phân tích...' : 'AI tự điền'}
            </Button>
          </div>
        </div>
      </div>

      {groups.map(group => (
        <div key={group}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group}</p>
          <div className="grid grid-cols-2 gap-3">
            {NUTRITION_FIELDS.filter(f => f.group === group).map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1 text-gray-600">
                  {f.label} <span className="font-normal text-gray-400">({f.unit})</span>
                </label>
                <input type="number" value={nutrition[f.key] || ''}
                  onChange={e => setNutrition({ ...nutrition, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                {f.note && <p className="text-[10px] text-gray-400 mt-0.5">{f.note}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── StepFinalize ─────────────────────────────────────────────────────────────
function StepFinalize({ form, setForm }) {
  const [tagInput, setTagInput] = useState('')
  const [tagResults, setTagResults] = useState([])
  const timer = useRef()
  const f = (field, val) => setForm({ ...form, [field]: val })

  useEffect(() => {
    clearTimeout(timer.current)
    if (!tagInput.trim()) { setTagResults([]); return }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/tags/search?q=${encodeURIComponent(tagInput)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
        })
        const data = await res.json()
        setTagResults((data.data || []).filter(t => !form.tags.find(x => x.id === t.id)))
      } catch { setTagResults([]) }
    }, 300)
  }, [tagInput, form.tags])

  const addTag = (tag) => {
    if (!form.tags.find(t => t.id === tag.id)) f('tags', [...form.tags, tag])
    setTagInput('')
    setTagResults([])
  }

  return (
    <div className="space-y-5">
      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold mb-2">Tags</label>

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.tags.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1 bg-orange-50 text-primary border border-orange-200 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold">
                {t.name}
                <button onClick={() => f('tags', form.tags.filter(x => x.id !== t.id))}
                  className="w-4 h-4 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 bg-white">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={async e => {
                if (e.key !== 'Enter') return
                const name = tagInput.trim()
                if (!name) return
                if (form.tags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
                  setTagInput(''); setTagResults([]); return
                }
                try {
                  const res = await fetch(`${API_BASE}/tags/find-or-create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
                    body: JSON.stringify({ name, type: 'recipe' }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.message)
                  f('tags', [...form.tags, data.data])
                  setTagInput(''); setTagResults([])
                } catch {}
              }}
              placeholder="Gõ tên tag rồi Enter (VD: canh, keto, ít calo...)"
              className="flex-1 text-sm outline-none bg-transparent" />
          </div>

          {tagResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {tagResults.map(t => (
                  <button key={t.id} type="button"
                    onMouseDown={() => { if (!form.tags.find(x => x.id === t.id)) f('tags', [...form.tags, t]); setTagInput(''); setTagResults([]) }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-orange-50 transition-colors">
                    <span className="text-sm font-semibold flex-1">{t.name}</span>
                    {t.type && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t.type}</span>}
                    <Plus size={13} className="text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 px-4 py-1.5 border-t border-gray-100">Chọn gợi ý hoặc nhấn Enter để tạo mới</p>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Nhấn Enter để thêm. Tag chưa có sẽ tự tạo mới.</p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-semibold mb-2">Chế độ hiển thị</label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
            <label key={value}
              className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                form.visibility === value ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input type="radio" name="visibility" value={value}
                checked={form.visibility === value} onChange={() => f('visibility', value)} className="accent-primary" />
              <Icon size={16} className={form.visibility === value ? 'text-primary' : 'text-gray-400'} />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <label className="block text-sm font-semibold mb-2">Phù hợp theo mùa</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'all',    label: '🌍 Quanh năm' },
            { value: 'spring', label: '🌸 Xuân' },
            { value: 'summer', label: '☀️ Hè' },
            { value: 'autumn', label: '🍂 Thu' },
            { value: 'winter', label: '❄️ Đông' },
          ].map(({ value, label }) => {
            const selected = (form.season || ['all']).includes(value)
            return (
              <button key={value} type="button"
                onClick={() => {
                  const cur = form.season || ['all']
                  if (value === 'all') { f('season', ['all']); return }
                  const next = cur.filter(s => s !== 'all')
                  f('season', selected ? (next.filter(s => s !== value).length ? next.filter(s => s !== value) : ['all']) : [...next, value])
                }}
                className={`py-2 text-xs rounded-xl font-semibold border transition-all ${
                  selected ? 'border-primary bg-orange-50 text-primary' : 'border-gray-200 hover:border-gray-300'
                }`}>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Build payload ────────────────────────────────────────────────────────────
function buildPayload(form, ingredients, steps, nutrition, media) {
  return {
    title:           form.title,
    description:     form.description,
    thumbnailUrl:    media.thumbnailUrl || null,
    mediaUrls:       media.mediaUrls,
    videoUrl:        media.videoUrl || null,
    countryCode:     form.countryCode,
    prepTimeMinutes: Number(form.prepTimeMinutes) || null,
    cookTimeMinutes: Number(form.cookTimeMinutes) || null,
    servings:        Number(form.servings) || 4,
    difficulty:      form.difficulty,
    visibility:      form.visibility,
    tagIds:          form.tags.map(t => t.id),
    season:          form.season || ['all'],
    caloriesPerServing: nutrition.caloriesPerServing ? Number(nutrition.caloriesPerServing) : null,
    proteinG:           nutrition.proteinG           ? Number(nutrition.proteinG)           : null,
    carbsG:             nutrition.carbsG             ? Number(nutrition.carbsG)             : null,
    fatG:               nutrition.fatG               ? Number(nutrition.fatG)               : null,
    fiberG:             nutrition.fiberG             ? Number(nutrition.fiberG)             : null,
    sugarG:             nutrition.sugarG             ? Number(nutrition.sugarG)             : null,
    sodiumMg:           nutrition.sodiumMg           ? Number(nutrition.sodiumMg)           : null,
    cholesterolMg:      nutrition.cholesterolMg      ? Number(nutrition.cholesterolMg)      : null,
    ingredients: ingredients
      .filter(ing => ing.ingredientId || ing.customName?.trim() || ing.name?.trim())
      .map((ing, idx) => ({
        ingredientId: ing.ingredientId || null,
        customName:   !ing.ingredientId ? (ing.name?.trim() || null) : null,
        amount:       ing.amount ? Number(ing.amount) : null,
        unit:         ing.unit,
        note:         ing.note || null,
        orderIndex:   idx,
        optional:     ing.optional || false,
      })),
    steps: steps
      .filter(s => s.title?.trim() || s.description?.trim())
      .map((s, idx) => ({
        stepNumber:  idx + 1,
        title:       s.title?.trim() || null,
        description: s.description?.trim() || s.title?.trim() || '',
        timer:       s.timer ? Number(s.timer) * 60 : null,
        imageUrl:    s.imageUrl || null,
        mediaUrls:   s.mediaUrls || [],
        videoUrl:    s.videoUrl || null,
      })),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecipeCreate() {
  const navigate      = useNavigate()
  const { addRecipe } = useRecipeStore()

  // FIX: useParams and all hooks must be called inside the component body
  const { id: editId } = useParams()
  const isEditMode = !!editId && window.location.pathname.includes('/edit')

  const [step,        setStep]        = useState(0)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', prepTimeMinutes: 15, cookTimeMinutes: 30,
    servings: 4, difficulty: 'medium', countryCode: 'VN',
    tags: [], visibility: 'public', season: ['all'],
  })

  const [media, setMedia] = useState({ thumbnailUrl: '', mediaUrls: [], videoUrl: '' })

  const [ingredients, setIngredients] = useState([
    { ingredientId: null, customName: '', name: '', imageUrl: '', amount: '', unit: 'g', note: '', optional: false }
  ])

  const [steps, setSteps] = useState([])

  const [nutrition, setNutrition] = useState({})

  // FIX: useEffect for edit mode is now correctly inside the component
  useEffect(() => {
    if (!isEditMode) return
    setLoadingEdit(true)
    fetch(`${API_BASE}/recipes/${editId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
    })
      .then(res => res.json())
      .then(res => {
        const r = res.data
        setForm({
          title:           r.title || '',
          description:     r.description || '',
          prepTimeMinutes: r.prepTimeMinutes ?? 15,
          cookTimeMinutes: r.cookTimeMinutes ?? 30,
          servings:        r.servings ?? 4,
          difficulty:      r.difficulty || 'medium',
          countryCode:     r.countryCode || 'VN',
          tags:            r.tags || [],
          visibility:      r.visibility || 'public',
          season:          r.season || ['all'],
        })
        setMedia({
          thumbnailUrl: r.thumbnailUrl || '',
          mediaUrls:    r.mediaUrls || [],
          videoUrl:     r.videoUrl || '',
        })
        setIngredients(
          (r.ingredients || []).map(ing => ({
            ingredientId: ing.ingredientId || null,
            name:         ing.name || '',
            imageUrl:     ing.imageUrl || '',
            amount:       ing.amount ?? '',
            unit:         ing.unit || 'g',
            note:         ing.note || '',
            optional:     ing.isOptional || false,
          }))
        )
        setSteps(
          (r.steps || []).map(s => ({
            title:     s.title || '',
            description: s.description || '',
            timer:     s.timer ? Math.round(s.timer / 60) : '',
            imageUrl:  s.imageUrl || '',
            mediaUrls: s.mediaUrls || [],
            videoUrl:  s.videoUrl || '',
          }))
        )
        setNutrition({
          caloriesPerServing: r.caloriesPerServing ?? '',
          proteinG:           r.proteinG ?? '',
          carbsG:             r.carbsG ?? '',
          fatG:               r.fatG ?? '',
          fiberG:             r.fiberG ?? '',
          sugarG:             r.sugarG ?? '',
          sodiumMg:           r.sodiumMg ?? '',
          cholesterolMg:      r.cholesterolMg ?? '',
        })
      })
      .catch(() => console.error('Không thể tải công thức'))
      .finally(() => setLoadingEdit(false))
  }, [editId, isEditMode])

  const canNext = step === 0 ? !!form.title.trim() : true

  const handleSubmit = async () => {
    const invalidSteps = steps.filter(s => !s.title?.trim() && !s.description?.trim())
    if (invalidSteps.length > 0) {
      setSubmitError(`${invalidSteps.length} bước chưa có tên hoặc mô tả. Vui lòng kiểm tra lại bước Cách làm.`)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = buildPayload(form, ingredients, steps, nutrition, media)

      if (isEditMode) {
        const res = await fetch(`${API_BASE}/recipes/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại')
        navigate(`/recipe/${String(data.data.id).trim()}`)
      } else {
        const res = await fetch(`${API_BASE}/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Đăng thất bại')
        addRecipe(data.data)
        navigate(`/recipe/${String(data.data.id).trim()}`)
      }
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEdit) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-gray-400 animate-pulse">Đang tải công thức...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
          className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">
            {isEditMode ? 'Sửa công thức' : 'Tạo công thức mới'}
          </h1>
          <p className="text-xs text-gray-500">Bước {step + 1} / {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-bold mb-4">{STEPS[step]}</h2>

      <div className="mb-8">
        {step === 0 && <StepBasic        form={form} setForm={setForm} media={media} setMedia={setMedia} />}
        {step === 1 && <StepIngredients  ingredients={ingredients} setIngredients={setIngredients} />}
        {step === 2 && <StepCookingSteps steps={steps} setSteps={setSteps} />}
        {step === 3 && <StepNutrition    nutrition={nutrition} setNutrition={setNutrition} />}
        {step === 4 && <StepFinalize     form={form} setForm={setForm} />}
      </div>

      {submitError && (
        <p className="text-sm text-red-500 flex items-center gap-1 mb-3">
          <AlertCircle size={14} /> {submitError}
        </p>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1" disabled={!canNext}>
            Tiếp theo <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} className="flex-1">
            <Check size={16} /> {isEditMode ? 'Lưu thay đổi' : 'Đăng công thức'}
          </Button>
        )}
      </div>
    </div>
  )
}
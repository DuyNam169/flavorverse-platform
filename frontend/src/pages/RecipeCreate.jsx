import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

// Full country list sorted by region
const COUNTRIES = [
  // Đông Nam Á
  { code: 'VN', label: 'Việt Nam',     flag: '🇻🇳' },
  { code: 'TH', label: 'Thái Lan',     flag: '🇹🇭' },
  { code: 'ID', label: 'Indonesia',    flag: '🇮🇩' },
  { code: 'MY', label: 'Malaysia',     flag: '🇲🇾' },
  { code: 'SG', label: 'Singapore',    flag: '🇸🇬' },
  { code: 'PH', label: 'Philippines',  flag: '🇵🇭' },
  { code: 'MM', label: 'Myanmar',      flag: '🇲🇲' },
  { code: 'KH', label: 'Campuchia',    flag: '🇰🇭' },
  { code: 'LA', label: 'Lào',          flag: '🇱🇦' },
  // Đông Á
  { code: 'CN', label: 'Trung Quốc',   flag: '🇨🇳' },
  { code: 'JP', label: 'Nhật Bản',     flag: '🇯🇵' },
  { code: 'KR', label: 'Hàn Quốc',     flag: '🇰🇷' },
  { code: 'TW', label: 'Đài Loan',     flag: '🇹🇼' },
  { code: 'HK', label: 'Hồng Kông',    flag: '🇭🇰' },
  // Nam Á
  { code: 'IN', label: 'Ấn Độ',        flag: '🇮🇳' },
  { code: 'PK', label: 'Pakistan',     flag: '🇵🇰' },
  { code: 'LK', label: 'Sri Lanka',    flag: '🇱🇰' },
  // Trung Đông
  { code: 'TR', label: 'Thổ Nhĩ Kỳ',  flag: '🇹🇷' },
  { code: 'IR', label: 'Iran',         flag: '🇮🇷' },
  { code: 'SA', label: 'Ả Rập Xê Út', flag: '🇸🇦' },
  { code: 'LB', label: 'Lebanon',      flag: '🇱🇧' },
  // Châu Âu
  { code: 'IT', label: 'Ý',            flag: '🇮🇹' },
  { code: 'FR', label: 'Pháp',         flag: '🇫🇷' },
  { code: 'ES', label: 'Tây Ban Nha',  flag: '🇪🇸' },
  { code: 'GR', label: 'Hy Lạp',       flag: '🇬🇷' },
  { code: 'DE', label: 'Đức',          flag: '🇩🇪' },
  { code: 'PT', label: 'Bồ Đào Nha',  flag: '🇵🇹' },
  { code: 'GB', label: 'Anh',          flag: '🇬🇧' },
  { code: 'RU', label: 'Nga',          flag: '🇷🇺' },
  // Châu Mỹ
  { code: 'MX', label: 'Mexico',       flag: '🇲🇽' },
  { code: 'US', label: 'Hoa Kỳ',       flag: '🇺🇸' },
  { code: 'BR', label: 'Brazil',       flag: '🇧🇷' },
  { code: 'PE', label: 'Peru',         flag: '🇵🇪' },
  { code: 'AR', label: 'Argentina',    flag: '🇦🇷' },
  { code: 'CO', label: 'Colombia',     flag: '🇨🇴' },
  // Châu Phi
  { code: 'MA', label: 'Maroc',        flag: '🇲🇦' },
  { code: 'ET', label: 'Ethiopia',     flag: '🇪🇹' },
  { code: 'NG', label: 'Nigeria',      flag: '🇳🇬' },
  { code: 'EG', label: 'Ai Cập',       flag: '🇪🇬' },
  // Châu Đại Dương
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

// ─── MediaUpload: đa ảnh + video, 1 ảnh đại diện ─────────────────────────────
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
          setThumbnailUrl(url)          // ảnh đầu tiên → thumbnail
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
    if (type === 'thumb')  { setThumbnailUrl(''); }
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
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:bg-orange-50/40 transition-colors cursor-pointer"
      >
        <input
          ref={inputRef} type="file" multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={e => handleFiles([...e.target.files])}
        />
        {uploading ? (
          <p className="text-sm text-primary animate-pulse">Đang tải lên...</p>
        ) : (
          <>
            <Upload size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-500">Kéo thả hoặc click để chọn</p>
            <p className="text-xs text-gray-400 mt-1">
              Ảnh PNG/JPG/WEBP hoặc Video MP4/MOV · Tối đa 100MB/file
            </p>
            <p className="text-xs text-primary mt-1">Ảnh đầu tiên sẽ là ảnh đại diện</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Preview grid */}
      {allMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {allMedia.map(({ url, type, label }) => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
              {type === 'video' ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={url} alt={label} className="w-full h-full object-cover" />
              )}
              {/* Badge */}
              <span className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                type === 'thumb' ? 'bg-primary text-white' :
                type === 'video' ? 'bg-purple-500 text-white' :
                'bg-black/50 text-white'
              }`}>
                {label}
              </span>
              {/* Remove */}
              <button
                onClick={() => removeMedia(url, type)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              {/* Set as thumb (chỉ với ảnh phụ) */}
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
          {/* Add more */}
          <button
            onClick={() => inputRef.current.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
          >
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
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span>
          {selected ? `${selected.flag} ${selected.label}` : 'Chọn quốc gia...'}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm quốc gia..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>
            ) : filtered.map(c => (
              <button
                key={c.code} type="button"
                onClick={() => { onChange(c.code); setOpen(false); setQuery('') }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-orange-50 transition-colors ${
                  value === c.code ? 'bg-orange-50 text-primary font-semibold' : ''
                }`}
              >
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
        <input
          value={form.title}
          onChange={e => f('title', e.target.value)}
          placeholder="VD: Phở Bò Hà Nội"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Mô tả</label>
        <textarea
          value={form.description}
          onChange={e => f('description', e.target.value)}
          placeholder="Giới thiệu ngắn về món ăn..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
        />
      </div>

      {/* Media upload */}
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
          { label: 'Thời gian chuẩn bị (phút)', key: 'prepTimeMinutes', type: 'number' },
          { label: 'Thời gian nấu (phút)',       key: 'cookTimeMinutes', type: 'number' },
          { label: 'Khẩu phần',                  key: 'servings',        type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key} className={key === 'servings' ? '' : ''}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={e => f(key, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold mb-1">Độ khó</label>
          <select
            value={form.difficulty}
            onChange={e => f('difficulty', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white"
          >
            <option value="easy">🟢 Dễ</option>
            <option value="medium">🟡 Vừa</option>
            <option value="hard">🔴 Khó</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Xuất xứ</label>
        <CountryDropdown
          value={form.countryCode}
          onChange={v => f('countryCode', v)}
        />
      </div>
    </div>
  )
}

// ─── IngredientSearch (dropdown search ingredient master) ─────────────────────
function IngredientSearch({ onSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const timer = useRef()

  // Tìm kiếm debounced
  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API_BASE}/recipes/ingredients/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
        })
        const data = await res.json()
        setResults(data.data || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  // Popular khi mở lần đầu, chưa gõ gì
  useEffect(() => {
    if (!open || query.trim()) return
    fetch(`${API_BASE}/recipes/ingredients/popular`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
    }).then(r => r.json()).then(d => setResults(d.data || [])).catch(() => {})
  }, [open, query])

  return (
    <div className="relative flex-1">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm nguyên liệu..."
          className="flex-1 text-sm outline-none"
        />
        {loading && <span className="text-xs text-gray-400 animate-pulse">...</span>}
      </div>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {results.length === 0 && !loading && query.trim() ? (
            /* Không tìm thấy → offer tạo mới */
            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-2">Không tìm thấy "{query}"</p>
              <button
                onClick={() => { onSelect({ _new: true, name: query }); setOpen(false); setQuery('') }}
                className="text-xs font-semibold text-primary flex items-center gap-1 mx-auto hover:underline"
              >
                <Plus size={12} /> Tạo nguyên liệu mới "{query}"
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {!query.trim() && (
                <p className="text-[10px] text-gray-400 px-3 pt-2 pb-1 uppercase tracking-wider font-semibold">Phổ biến</p>
              )}
              {results.map(ing => (
                <button
                  key={ing.id} type="button"
                  onMouseDown={() => { onSelect(ing); setOpen(false); setQuery('') }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-orange-50 transition-colors"
                >
                  {ing.imageUrl ? (
                    <img src={ing.imageUrl} alt={ing.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-base">🥕</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ing.name}</p>
                    {ing.tags?.length > 0 && (
                      <p className="text-xs text-gray-400 truncate">{ing.tags.join(', ')}</p>
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
  const [name,      setName]      = useState(initialName || '')
  const [tags,      setTags]      = useState([])
  const [tagInput,  setTagInput]  = useState('')
  const [imageUrl,  setImageUrl]  = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef()

  useEffect(() => { if (open) setName(initialName || '') }, [open, initialName])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleImageUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'image')
      setImageUrl(url)
    } catch (e) { setError(e.message) }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Tên không được để trống'); return }
    setSaving(true)
    setError('')
    try {
      const res  = await fetch(`${API_BASE}/recipes/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ name: name.trim(), tags, imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Tạo thất bại')
      onCreate(data.data)
      onClose()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tạo nguyên liệu mới">
      <div className="space-y-4">
        {/* Ảnh */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => fileRef.current.click()}
            className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden flex-shrink-0"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            ) : uploading ? (
              <span className="text-xs text-gray-400 animate-pulse">...</span>
            ) : (
              <Image size={24} className="text-gray-300" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Tên nguyên liệu *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Thịt bò Wagyu"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-1">Tags phân loại</label>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="thịt, rau, gia vị... (Enter)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button size="sm" onClick={addTag}><Plus size={14} /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 bg-orange-100 text-primary rounded-full font-semibold flex items-center gap-1">
                {t}
                <button onClick={() => setTags(tags.filter(x => x !== t))}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Huỷ</Button>
          <Button onClick={handleSubmit} loading={saving} className="flex-1"><Check size={14} /> Tạo</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── StepIngredients ──────────────────────────────────────────────────────────
function StepIngredients({ ingredients, setIngredients }) {
  const [createModal, setCreateModal] = useState({ open: false, name: '', rowIdx: null })

  const addBlankRow = () =>
    setIngredients([...ingredients, { masterId: null, name: '', amount: '', unit: 'g', note: '', optional: false }])

  const remove  = i => setIngredients(ingredients.filter((_, idx) => idx !== i))
  const update  = (i, field, val) => {
    const next = [...ingredients]
    next[i] = { ...next[i], [field]: val }
    setIngredients(next)
  }

  const handleSelect = (i, ing) => {
    if (ing._new) {
      // mở modal tạo mới
      setCreateModal({ open: true, name: ing.name, rowIdx: i })
    } else {
      update(i, 'masterId', ing.id)
      update(i, 'name',     ing.name)
      update(i, 'imageUrl', ing.imageUrl || '')
    }
  }

  const handleCreated = (newIng) => {
    const i = createModal.rowIdx
    if (i !== null) {
      update(i, 'masterId', newIng.id)
      update(i, 'name',     newIng.name)
      update(i, 'imageUrl', newIng.imageUrl || '')
    }
    setCreateModal({ open: false, name: '', rowIdx: null })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Tìm kiếm nguyên liệu từ thư viện. Nếu chưa có, bạn có thể tạo mới.</p>

      {ingredients.map((ing, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <GripVertical size={15} className="text-gray-300 flex-shrink-0 cursor-grab" />

            {/* Ảnh nguyên liệu (nếu đã chọn) */}
            {ing.imageUrl ? (
              <img src={ing.imageUrl} alt={ing.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm">🥕</div>
            )}

            {/* Tên (nếu đã chọn → hiện tên; chưa chọn → search) */}
            {ing.masterId ? (
              <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold flex-1">{ing.name}</span>
                <button
                  onClick={() => { update(i, 'masterId', null); update(i, 'name', ''); update(i, 'imageUrl', '') }}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <IngredientSearch onSelect={ing => handleSelect(i, ing)} />
            )}

            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Lượng + đơn vị + ghi chú + optional */}
          <div className="flex items-center gap-2 pl-7">
            <input
              type="number" value={ing.amount}
              onChange={e => update(i, 'amount', e.target.value)}
              placeholder="Lượng"
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
            />
            <select
              value={ing.unit}
              onChange={e => update(i, 'unit', e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none"
            >
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
            <input
              value={ing.note}
              onChange={e => update(i, 'note', e.target.value)}
              placeholder="Ghi chú (tùy chọn)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
            />
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer flex-shrink-0">
              <input
                type="checkbox" checked={ing.optional}
                onChange={e => update(i, 'optional', e.target.checked)}
                className="accent-primary"
              />
              Tùy chọn
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={addBlankRow}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Thêm nguyên liệu
      </button>

      <CreateIngredientModal
        open={createModal.open}
        initialName={createModal.name}
        onClose={() => setCreateModal({ open: false, name: '', rowIdx: null })}
        onCreate={handleCreated}
      />
    </div>
  )
}

// ─── StepMedia (ảnh/video cho từng bước) ─────────────────────────────────────
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
    imageUrl  && { url: imageUrl,  type: 'image', label: 'Ảnh đại diện' },
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
            <span className={`absolute top-0.5 left-0.5 text-[9px] font-bold px-1 rounded ${
              type === 'image' ? 'bg-primary text-white' :
              type === 'video' ? 'bg-purple-500 text-white' :
              'bg-black/50 text-white'
            }`}>{label}</span>
            <button
              onClick={() => {
                if (type === 'image') setImageUrl('')
                if (type === 'video') setVideoUrl('')
                if (type === 'extra') setMediaUrls(p => p.filter(u => u !== url))
              }}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full items-center justify-center hidden group-hover:flex"
            >
              <X size={8} />
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          onClick={() => inputRef.current.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors flex-shrink-0"
        >
          {uploading ? (
            <span className="text-[10px] animate-pulse">...</span>
          ) : (
            <>
              <Plus size={16} />
              <span className="text-[10px] mt-0.5">Ảnh/Video</span>
            </>
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
      {steps.map((step, i) => (
        <div key={i} className="card p-4 border-l-4 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </div>
            <input
              value={step.title}
              onChange={e => update(i, 'title', e.target.value)}
              placeholder="Tên bước (VD: Luộc xương)"
              className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5 text-sm border border-gray-100 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>

          <textarea
            value={step.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Mô tả chi tiết cách thực hiện bước này..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 mb-2"
          />

          <div className="flex items-center gap-2 mb-2">
            <input
              type="number" value={step.timer}
              onChange={e => update(i, 'timer', e.target.value)}
              placeholder="Hẹn giờ (phút)"
              className="w-36 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            />
            <span className="text-xs text-gray-400">phút</span>
          </div>

          {/* Media cho từng bước */}
          <StepMedia
            imageUrl={step.imageUrl || ''}
            setImageUrl={v => update(i, 'imageUrl', v)}
            mediaUrls={step.mediaUrls || []}
            setMediaUrls={v => update(i, 'mediaUrls', typeof v === 'function' ? v(step.mediaUrls || []) : v)}
            videoUrl={step.videoUrl || ''}
            setVideoUrl={v => update(i, 'videoUrl', v)}
          />
        </div>
      ))}

      <button
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Thêm bước
      </button>
    </div>
  )
}

// ─── StepNutrition ────────────────────────────────────────────────────────────
const NUTRITION_FIELDS = [
  // Macros
  { key: 'caloriesPerServing', label: 'Calo',          unit: 'kcal', group: 'Macros chính',       type: 'int',   note: 'Tổng năng lượng/khẩu phần' },
  { key: 'proteinG',          label: 'Protein',        unit: 'g',    group: 'Macros chính',       type: 'dec' },
  { key: 'carbsG',            label: 'Carbohydrate',   unit: 'g',    group: 'Macros chính',       type: 'dec' },
  { key: 'fatG',              label: 'Chất béo',       unit: 'g',    group: 'Macros chính',       type: 'dec' },
  // Micros quan trọng
  { key: 'fiberG',            label: 'Chất xơ',        unit: 'g',    group: 'Chất xơ & đường',   type: 'dec' },
  { key: 'sugarG',            label: 'Đường',          unit: 'g',    group: 'Chất xơ & đường',   type: 'dec' },
  // Chuẩn FDA
  { key: 'sodiumMg',          label: 'Natri (Muối)',   unit: 'mg',   group: 'Khoáng chất & mỡ',  type: 'int',   note: 'Giới hạn khuyến nghị: <2300mg/ngày' },
  { key: 'cholesterolMg',     label: 'Cholesterol',    unit: 'mg',   group: 'Khoáng chất & mỡ',  type: 'int',   note: '<300mg/ngày theo WHO' },
]

function StepNutrition({ nutrition, setNutrition }) {
  const [aiLoading, setAiLoading] = useState(false)

  const handleAiFill = () => {
    setAiLoading(true)
    setTimeout(() => {
      setNutrition({
        caloriesPerServing: 420, proteinG: 32, carbsG: 48, fatG: 12,
        fiberG: 4, sugarG: 6, sodiumMg: 680, cholesterolMg: 85,
      })
      setAiLoading(false)
    }, 1800)
  }

  // Group by
  const groups = [...new Set(NUTRITION_FIELDS.map(f => f.group))]

  return (
    <div className="space-y-5">
      {/* AI card */}
      <div className="card p-4 border border-primary/20 bg-gradient-to-br from-orange-50 to-white">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">AI tự động điền dinh dưỡng</p>
            <p className="text-xs text-gray-500 mb-3">
              AI phân tích nguyên liệu và ước tính theo chuẩn FDA/WHO gồm 8 chỉ số quan trọng.
            </p>
            <Button size="sm" loading={aiLoading} onClick={handleAiFill}>
              <Sparkles size={14} /> {aiLoading ? 'Đang phân tích...' : 'AI tự điền'}
            </Button>
          </div>
        </div>
      </div>

      {/* Fields grouped */}
      {groups.map(group => (
        <div key={group}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group}</p>
          <div className="grid grid-cols-2 gap-3">
            {NUTRITION_FIELDS.filter(f => f.group === group).map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1 text-gray-600">
                  {f.label} <span className="font-normal text-gray-400">({f.unit})</span>
                </label>
                <input
                  type="number" value={nutrition[f.key] || ''}
                  onChange={e => setNutrition({ ...nutrition, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
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
  const [selectedTags, setSelectedTags] = useState([])
  const f = (field, val) => setForm({ ...form, [field]: val })

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) f('tags', [...form.tags, t])
    setTagInput('')
  }

  return (
    <div className="space-y-5">
      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Thêm tag, ấn Enter"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="sm" onClick={addTag}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map(t => (
            <button
              key={t}
              onClick={() => f('tags', form.tags.filter(x => x !== t))}
              className="text-xs px-3 py-1 bg-orange-100 text-primary rounded-full font-semibold flex items-center gap-1 hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              {t} <X size={10} />
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-semibold mb-2">Chế độ hiển thị</label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                form.visibility === value
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio" name="visibility" value={value}
                checked={form.visibility === value}
                onChange={() => f('visibility', value)}
                className="accent-primary"
              />
              <Icon size={16} className={form.visibility === value ? 'text-primary' : 'text-gray-400'} />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Health note */}
      <div>
        <label className="block text-sm font-semibold mb-2">Khuyến cáo sức khỏe <span className="font-normal text-gray-400">(tùy chọn)</span></label>
        <textarea
          value={form.healthNote || ''}
          onChange={e => f('healthNote', e.target.value)}
          placeholder="VD: Không phù hợp cho người dị ứng gluten, người tiểu đường nên hạn chế..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
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
              <button
                key={value} type="button"
                onClick={() => {
                  const cur = form.season || ['all']
                  if (value === 'all') { f('season', ['all']); return }
                  const next = cur.filter(s => s !== 'all')
                  f('season', selected ? next.filter(s => s !== value) || ['all'] : [...next, value])
                }}
                className={`py-2 text-xs rounded-xl font-semibold border transition-all ${
                  selected ? 'border-primary bg-orange-50 text-primary' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
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
    title:          form.title,
    description:    form.description,
    thumbnailUrl:   media.thumbnailUrl,
    mediaUrls:      media.mediaUrls,
    videoUrl:       media.videoUrl,
    countryCode:    form.countryCode,
    prepTimeMinutes: Number(form.prepTimeMinutes),
    cookTimeMinutes: Number(form.cookTimeMinutes),
    servings:       Number(form.servings),
    difficulty:     form.difficulty,
    visibility:     form.visibility,
    tagIds: form.tags.map(t => t.id),
    season:         form.season || ['all'],
    // Nutrition
    caloriesPerServing: nutrition.caloriesPerServing ? Number(nutrition.caloriesPerServing) : null,
    proteinG:           nutrition.proteinG           ? Number(nutrition.proteinG)           : null,
    carbsG:             nutrition.carbsG             ? Number(nutrition.carbsG)             : null,
    fatG:               nutrition.fatG               ? Number(nutrition.fatG)               : null,
    fiberG:             nutrition.fiberG             ? Number(nutrition.fiberG)             : null,
    sugarG:             nutrition.sugarG             ? Number(nutrition.sugarG)             : null,
    sodiumMg:           nutrition.sodiumMg           ? Number(nutrition.sodiumMg)           : null,
    cholesterolMg:      nutrition.cholesterolMg      ? Number(nutrition.cholesterolMg)      : null,
    // Ingredients
    ingredients: ingredients
      .filter(ing => ing.name.trim())
      .map((ing, idx) => ({
        masterId:   ing.masterId   || null,
        name:       ing.name,
        amount:     ing.amount     ? Number(ing.amount) : null,
        unit:       ing.unit,
        note:       ing.note       || null,
        orderIndex: idx,
        optional:   ing.optional   || false,
      })),
    // Steps
    steps: steps
      .filter(s => s.description.trim())
      .map((s, idx) => ({
        stepNumber:   idx + 1,
        title:        s.title        || null,
        description:  s.description,
        timer:        s.timer        ? Number(s.timer) : null,
        imageUrl:     s.imageUrl     || null,
        mediaUrls:    s.mediaUrls    || [],
        videoUrl:     s.videoUrl     || null,
      })),
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecipeCreate() {
  const navigate      = useNavigate()
  const { addRecipe } = useRecipeStore()

  const [step,        setStep]        = useState(0)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', prepTimeMinutes: 15, cookTimeMinutes: 30,
    servings: 4, difficulty: 'medium', countryCode: 'VN',
    tags: [], visibility: 'public', season: ['all'], healthNote: '',
  })

  const [media, setMedia] = useState({
    thumbnailUrl: '', mediaUrls: [], videoUrl: '',
  })

  const [ingredients, setIngredients] = useState([
    { masterId: null, name: '', amount: '', unit: 'g', note: '', optional: false }
  ])

  const [steps, setSteps] = useState([
    { title: '', description: '', timer: '', imageUrl: '', mediaUrls: [], videoUrl: '' }
  ])

  const [nutrition, setNutrition] = useState({})

  const canNext = step === 0 ? !!form.title.trim() : true

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = buildPayload(form, ingredients, steps, nutrition, media)
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
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
          className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-primary transition-colors"
        >
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
            <div className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      {/* Step title */}
      <h2 className="font-display text-lg font-bold mb-4">{STEPS[step]}</h2>

      {/* Content */}
      <div className="mb-8">
        {step === 0 && <StepBasic     form={form} setForm={setForm} media={media} setMedia={setMedia} />}
        {step === 1 && <StepIngredients ingredients={ingredients} setIngredients={setIngredients} />}
        {step === 2 && <StepCookingSteps steps={steps} setSteps={setSteps} />}
        {step === 3 && <StepNutrition  nutrition={nutrition} setNutrition={setNutrition} />}
        {step === 4 && <StepFinalize   form={form} setForm={setForm} />}
      </div>

      {/* Error */}
      {submitError && (
        <p className="text-sm text-red-500 flex items-center gap-1 mb-3">
          <AlertCircle size={14} /> {submitError}
        </p>
      )}

      {/* Navigation */}
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
            <Check size={16} /> Đăng công thức
          </Button>
        )}
      </div>
    </div>
  )
}
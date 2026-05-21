import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, MapPin, Heart, AlertCircle, Camera, Lock, LogOut, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/index.js'
import api from '../api/index.js'
import toast from 'react-hot-toast'

const DIET_OPTIONS = [
  { value: 'normal',     label: '🍽️ Ăn bình thường' },
  { value: 'vegetarian', label: '🥗 Chay (có trứng/sữa)' },
  { value: 'vegan',      label: '🌱 Thuần chay' },
  { value: 'keto',       label: '🥑 Keto' },
]

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },                 { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },                     { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },                      { code: 'AG', name: 'Antigua và Barbuda' },

  { code: 'AR', name: 'Argentina' },                   { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Úc' },                          { code: 'AT', name: 'Áo' },
  { code: 'AZ', name: 'Azerbaijan' },                  { code: 'BS', name: 'Bahamas' },

  { code: 'BH', name: 'Bahrain' },                     { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },                    { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Bỉ' },                          { code: 'BZ', name: 'Belize' },

  { code: 'BJ', name: 'Benin' },                       { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },                     { code: 'BA', name: 'Bosnia và Herzegovina' },
  { code: 'BW', name: 'Botswana' },                    { code: 'BR', name: 'Brazil' },

  { code: 'BN', name: 'Brunei' },                      { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },                { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },                  { code: 'KH', name: 'Campuchia' },

  { code: 'CM', name: 'Cameroon' },                    { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Cộng hòa Trung Phi' },          { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },                       { code: 'CN', name: 'Trung Quốc' },

  { code: 'CO', name: 'Colombia' },                    { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },                       { code: 'CD', name: 'Cộng hòa Dân chủ Congo' },
  { code: 'CR', name: 'Costa Rica' },                  { code: 'CI', name: 'Bờ Biển Ngà' },

  { code: 'HR', name: 'Croatia' },                     { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Síp' },                         { code: 'CZ', name: 'Séc' },
  { code: 'DK', name: 'Đan Mạch' },                    { code: 'DJ', name: 'Djibouti' },

  { code: 'DM', name: 'Dominica' },                    { code: 'DO', name: 'Cộng hòa Dominica' },
  { code: 'EC', name: 'Ecuador' },                     { code: 'EG', name: 'Ai Cập' },
  { code: 'SV', name: 'El Salvador' },                 { code: 'GQ', name: 'Guinea Xích Đạo' },

  { code: 'ER', name: 'Eritrea' },                     { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },                    { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },                        { code: 'FI', name: 'Phần Lan' },

  { code: 'FR', name: 'Pháp' },                        { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },                      { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Đức' },                         { code: 'GH', name: 'Ghana' },

  { code: 'GR', name: 'Hy Lạp' },                      { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },                   { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },               { code: 'GY', name: 'Guyana' },

  { code: 'HT', name: 'Haiti' },                       { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },                     { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'Ấn Độ' },                       { code: 'ID', name: 'Indonesia' },

  { code: 'IR', name: 'Iran' },                        { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },                     { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Ý' },                           { code: 'JM', name: 'Jamaica' },

  { code: 'JP', name: 'Nhật Bản' },                    { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },                  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },                    { code: 'KP', name: 'Triều Tiên' },

  { code: 'KR', name: 'Hàn Quốc' },                    { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },                  { code: 'LA', name: 'Lào' },
  { code: 'LV', name: 'Latvia' },                      { code: 'LB', name: 'Lebanon' },

  { code: 'LS', name: 'Lesotho' },                     { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },                       { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },                   { code: 'LU', name: 'Luxembourg' },

  { code: 'MG', name: 'Madagascar' },                  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },                    { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },                        { code: 'MT', name: 'Malta' },

  { code: 'MH', name: 'Quần đảo Marshall' },           { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },                   { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },                  { code: 'MD', name: 'Moldova' },

  { code: 'MC', name: 'Monaco' },                      { code: 'MN', name: 'Mông Cổ' },
  { code: 'ME', name: 'Montenegro' },                  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },                  { code: 'MM', name: 'Myanmar' },

  { code: 'NA', name: 'Namibia' },                     { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },                       { code: 'NL', name: 'Hà Lan' },
  { code: 'NZ', name: 'New Zealand' },                 { code: 'NI', name: 'Nicaragua' },

  { code: 'NE', name: 'Niger' },                       { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'Bắc Macedonia' },               { code: 'NO', name: 'Na Uy' },
  { code: 'OM', name: 'Oman' },                        { code: 'PK', name: 'Pakistan' },

  { code: 'PW', name: 'Palau' },                       { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },                      { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },                    { code: 'PE', name: 'Peru' },

  { code: 'PH', name: 'Philippines' },                 { code: 'PL', name: 'Ba Lan' },
  { code: 'PT', name: 'Bồ Đào Nha' },                  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },                     { code: 'RU', name: 'Nga' },

  { code: 'RW', name: 'Rwanda' },                      { code: 'KN', name: 'Saint Kitts và Nevis' },
  { code: 'LC', name: 'Saint Lucia' },                 { code: 'VC', name: 'Saint Vincent và Grenadines' },
  { code: 'WS', name: 'Samoa' },                       { code: 'SM', name: 'San Marino' },

  { code: 'ST', name: 'Sao Tome và Principe' },        { code: 'SA', name: 'Ả Rập Saudi' },
  { code: 'SN', name: 'Senegal' },                     { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },                  { code: 'SL', name: 'Sierra Leone' },

  { code: 'SG', name: 'Singapore' },                   { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },                    { code: 'SB', name: 'Quần đảo Solomon' },
  { code: 'SO', name: 'Somalia' },                     { code: 'ZA', name: 'Nam Phi' },

  { code: 'SS', name: 'Nam Sudan' },                   { code: 'ES', name: 'Tây Ban Nha' },
  { code: 'LK', name: 'Sri Lanka' },                   { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },                    { code: 'SE', name: 'Thụy Điển' },

  { code: 'CH', name: 'Thụy Sĩ' },                     { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Đài Loan' },                    { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },                    { code: 'TH', name: 'Thái Lan' },

  { code: 'TL', name: 'Đông Timor' },                  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },                       { code: 'TT', name: 'Trinidad và Tobago' },
  { code: 'TN', name: 'Tunisia' },                     { code: 'TR', name: 'Thổ Nhĩ Kỳ' },

  { code: 'TM', name: 'Turkmenistan' },                { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },                      { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'UAE' },                         { code: 'GB', name: 'Anh' },

  { code: 'US', name: 'Hoa Kỳ' },                      { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },                  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican' },                     { code: 'VE', name: 'Venezuela' },

  { code: 'VN', name: 'Việt Nam' },                    { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },                      { code: 'ZW', name: 'Zimbabwe' }
];

function DefaultAvatar({ email, size = 80 }) {
  const letter = (email || 'U')[0].toUpperCase()
  return (
    <div style={{ width: size, height: size }}
      className="rounded-full bg-[#E8603C] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
      {letter}
    </div>
  )
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp'); return
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số'); return
    }
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Đổi mật khẩu thành công!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[380px]">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔑</div>
          <h3 className="font-bold text-xl text-[#1a1a2e]">Đổi mật khẩu</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'currentPassword', label: 'Mật khẩu hiện tại' },
            { key: 'newPassword', label: 'Mật khẩu mới' },
            { key: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              <input type="password" value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3 rounded-xl text-sm mt-2 disabled:opacity-70">
            {loading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
          <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 mt-1">Hủy</button>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuthStore()
  const fileRef = useRef()

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    username:    user?.username || '',
    bio:         user?.bio || '',
    countryCode: user?.countryCode || 'VN',
    dateOfBirth: user?.dateOfBirth || '',
    calorieGoal: user?.calorieGoal || 2000,
    dietType:    user?.dietType || 'normal',
    avatarUrl:   user?.avatarUrl || '',
  })
  const [allergyTags, setAllergyTags]   = useState(user?.allergyTags || [])
  const [allergyInput, setAllergyInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])

  const [saving, setSaving]             = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [countryOpen, setCountryOpen]   = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase()))

  const selectedCountry = COUNTRIES.find(c => c.code === form.countryCode)

  // Search tag từ API
  useEffect(() => {
    if (allergyInput.length < 1) { setTagSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/tags/search?q=${allergyInput}`)
        setTagSuggestions(res.data.data.filter(t =>
          !allergyTags.find(a => a.name === t.name)))
      } catch { setTagSuggestions([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [allergyInput, allergyTags])

  const addAllergyTag = (tag) => {
    setAllergyTags(prev => [...prev, tag])
    setAllergyInput('')
    setTagSuggestions([])
  }

  const addNewAllergyTag = () => {
    const name = allergyInput.trim()
    if (!name || allergyTags.find(t => t.name === name)) return
    addAllergyTag({ id: null, name, slug: '', type: 'allergy' })
  }

  const removeAllergyTag = (name) =>
    setAllergyTags(prev => prev.filter(t => t.name !== name))

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await api.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, avatarUrl: res.data.data.url }))
      toast.success('Tải ảnh lên thành công!')
    } catch { toast.error('Tải ảnh lên thất bại') }
    finally { setUploadingAvatar(false) }
  }

  // Save
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/users/me', {
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        allergyTagNames: allergyTags.map(t => t.name),
      })
      login({ ...user, ...res.data.data })
      toast.success('Đã lưu cài đặt!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu thất bại')
    } finally { setSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-[#E8603C] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Cài đặt</h1>
      </div>

      {/* Avatar */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 flex items-center gap-4">
        <div className="relative">
          {avatarPreview
            ? <img src={avatarPreview} alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#E8603C]/20" />
            : <DefaultAvatar email={user?.email} size={80} />}
          <button onClick={() => fileRef.current.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#E8603C] rounded-full flex items-center justify-center shadow-md hover:bg-[#d4522f] transition-colors">
            <Camera size={13} color="white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-sm">{form.displayName || form.username}</p>
          <p className="text-xs text-gray-400">{user?.username}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          {uploadingAvatar && <p className="text-xs text-[#E8603C] mt-1">Đang tải ảnh...</p>}
        </div>
      </section>

      {/* Thông tin cá nhân */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">👤 Thông tin cá nhân</h2>
        <div className="space-y-3">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tên hiển thị</label>
            <input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })}
              placeholder="Tên hiển thị (tùy ý)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Dùng để người khác tìm thấy bạn, không được trùng</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input value={user?.email || ''} disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
            <input type="date" value={form.dateOfBirth}
              onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Giới thiệu bản thân</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
          </div>

          {/* Country dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <MapPin size={12} /> Quốc gia
            </label>
            <button type="button" onClick={() => setCountryOpen(!countryOpen)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between hover:border-[#E8603C] transition-colors focus:outline-none">
              <span className={selectedCountry ? 'text-gray-800' : 'text-gray-400'}>
                {selectedCountry ? selectedCountry.name : 'Chọn quốc gia'}
              </span>
              <span className="text-gray-400 text-xs">{countryOpen ? '▲' : '▼'}</span>
            </button>
            {countryOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input autoFocus value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      placeholder="Tìm quốc gia..."
                      className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30" />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCountries.map(c => (
                    <button key={c.code} type="button"
                      onClick={() => { setForm(f => ({ ...f, countryCode: c.code })); setCountryOpen(false); setCountrySearch('') }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${form.countryCode === c.code ? 'bg-orange-50 text-[#E8603C] font-semibold' : 'text-gray-700'}`}>
                      {c.name} <span className="text-gray-400 text-xs">({c.code})</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 &&
                    <p className="text-center text-gray-400 text-sm py-4">Không tìm thấy</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mục tiêu sức khỏe */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Heart size={16} className="text-[#E8603C]" /> Mục tiêu sức khỏe
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mục tiêu calo/ngày</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1200} max={4000} step={50} value={form.calorieGoal}
                onChange={e => setForm({ ...form, calorieGoal: Number(e.target.value) })}
                className="flex-1 accent-[#E8603C]" />
              <span className="font-bold text-[#E8603C] w-20 text-right">{form.calorieGoal} kcal</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1,200</span><span>4,000</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Chế độ ăn</label>
            <div className="grid grid-cols-2 gap-2">
              {DIET_OPTIONS.map(o => (
                <label key={o.value}
                  className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${form.dietType === o.value ? 'border-[#E8603C] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="diet" value={o.value} checked={form.dietType === o.value}
                    onChange={() => setForm({ ...form, dietType: o.value })} className="accent-[#E8603C]" />
                  <span className="text-xs font-semibold">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dị ứng hashtag */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <AlertCircle size={16} className="text-yellow-500" /> Dị ứng & Kiêng kỵ
        </h2>
        <p className="text-xs text-gray-400 mb-3">Nhập tên, chọn từ gợi ý hoặc nhấn Enter để tạo tag mới</p>
        <div className="min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[#E8603C]/30 focus-within:border-[#E8603C] transition-colors">
          {allergyTags.map(tag => (
            <span key={tag.name}
              className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold">
              #{tag.name}
              <button type="button" onClick={() => removeAllergyTag(tag.name)}
                className="ml-0.5 hover:text-red-800 text-red-400 leading-none">×</button>
            </span>
          ))}
          <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ',') && allergyInput.trim()) {
                e.preventDefault(); addNewAllergyTag()
              }
              if (e.key === 'Backspace' && !allergyInput && allergyTags.length > 0)
                removeAllergyTag(allergyTags[allergyTags.length - 1].name)
            }}
            placeholder={allergyTags.length === 0 ? 'VD: Gluten, Sữa, Hải sản...' : ''}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent" />
        </div>

        {/* Gợi ý từ DB */}
        {tagSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tagSuggestions.map(t => (
              <button key={t.id} type="button" onClick={() => addAllergyTag(t)}
                className="px-3 py-1 bg-orange-50 text-[#E8603C] border border-orange-200 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors">
                + #{t.name}
                {t.useCount > 0 && <span className="text-gray-400 ml-1">({t.useCount})</span>}
              </button>
            ))}
          </div>
        )}

        {/* Tạo mới nếu không có */}
        {allergyInput.trim() && tagSuggestions.length === 0 && (
          <button type="button" onClick={addNewAllergyTag}
            className="mt-2 px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors">
            + Tạo tag "#{allergyInput.trim()}"
          </button>
        )}
      </section>

      {/* Actions */}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2 mb-3">
        <Save size={16} />
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>

      <button onClick={() => setShowChangePw(true)}
        className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#E8603C] hover:text-[#E8603C] transition-colors flex items-center justify-center gap-2 mb-3">
        <Lock size={16} /> Đổi mật khẩu
      </button>

      <button onClick={handleLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <LogOut size={16} /> Đăng xuất
      </button>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/index.js'
import { useGoogleLogin } from '@react-oauth/google'
import api from '../api/index.js'
import toast from 'react-hot-toast'

// ── Google OAuth helper ───────────────────────────────────────
// Production: replace with real Google OAuth flow
// import { googleLogin } from '../api/index.js'

const FEATURES = [
  { icon: '🍜', label: 'Khám phá công thức', desc: 'Hàng nghìn món ăn từ cộng đồng đầu bếp Việt' },
  { icon: '🤝', label: 'Chia sẻ & Fork', desc: 'Lưu và tuỳ biến công thức theo khẩu vị riêng' },
  { icon: '📅', label: 'Lên thực đơn cả tuần', desc: 'Tự động gợi ý bữa ăn thông minh mỗi ngày' },
]

const BG_IMAGE =
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80'

export default function Auth() {
  const navigate = useNavigate()
  const { login, isLoggedIn } = useAuthStore()

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })
  const [imageLoaded, setImageLoaded] = useState(false)

  const [forgotStep, setForgotStep] = useState(null) // null | 'email' | 'otp' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn])

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      setLoading(true)
      try {
        const res = await api.post('/auth/google/callback', { code })
        const { accessToken, refreshToken, user } = res.data.data
        localStorage.setItem('jwt_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        login(user)
        navigate('/')
      } catch (err) {
        toast.error('Đăng nhập thất bại, thử lại nhé!')
      } finally {
        setLoading(false)
      }
    },
    onError: () => toast.error('Google từ chối đăng nhập'),
  })

  const handleGoogleLogin = () => googleLogin()

  const validate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ')
      return false
    }
    if (tab === 'register') {
      if (!formData.username.trim()) {
        toast.error('Vui lòng nhập username'); return false
      }
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
        toast.error('Username chỉ gồm chữ, số, dấu _ và 3-30 ký tự'); return false
      }
      const pwRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!pwRegex.test(formData.password)) {
        toast.error('Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số'); return false
      }
    }
    return true
  }

  const handleEmailLogin = async (e) => {
      e.preventDefault()
      if (!validate()) return  
      setLoading(true)
      try {
          const endpoint = tab === 'login' ? '/auth/login' : '/auth/register'
          const payload = tab === 'login'
              ? { email: formData.email, password: formData.password }
              : { email: formData.email, password: formData.password, username: formData.username }

          const res = await api.post(endpoint, payload)
          const { accessToken, refreshToken, user } = res.data.data
          localStorage.setItem('jwt_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
          login(user)
          navigate('/')
      } catch (err) {
          toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
      } finally {
          setLoading(false)
      }
  }

  const handleForgotSendOtp = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(forgotEmail)) { toast.error('Email không hợp lệ'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      toast.success('Đã gửi OTP về email!')
      setForgotStep('otp')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi OTP thất bại')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error('OTP gồm 6 số'); return }
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email: forgotEmail, otp: otpValue })
      setForgotStep('reset')
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP không hợp lệ')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async () => {
    const pwRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!pwRegex.test(newPassword)) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: otpValue, newPassword })
      toast.success('Đặt lại mật khẩu thành công!')
      setForgotStep(null)
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background image */}
        <img
          src={BG_IMAGE}
          alt="cooking"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C1A0E]/80 via-[#E8603C]/40 to-[#2C1A0E]/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
              🍜
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                FlavorVerse
              </h1>
              <p className="text-white/60 text-xs">Kết nối. Chia sẻ. Nấu ăn cùng nhau.</p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <p className="text-white/40 text-xs">
            © 2025 FlavorVerse · Mạng xã hội ẩm thực thông minh
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FFF8F0] px-6 py-10 relative">

        {/* Language pill (top right, like Medsphere) */}
        <div className="absolute top-5 right-5 flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm cursor-pointer hover:border-[#E8603C] transition-colors">
          <span>🌐</span> VI
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <span className="text-3xl">🍜</span>
          <span className="font-bold text-xl text-[#E8603C]" style={{ fontFamily: "'Playfair Display', serif" }}>FlavorVerse</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-lg shadow-orange-100 border border-orange-50 p-8">

          {/* Title */}
          <div className="mb-7 text-center">
            <h2 className="text-[#1a1a2e] font-bold text-2xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {tab === 'login' ? 'Đăng nhập FlavorVerse' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-gray-400 text-sm">
              {tab === 'login'
                ? 'Cộng đồng ẩm thực của bạn, tất cả trong một nơi.'
                : 'Bắt đầu hành trình ẩm thực của bạn hôm nay.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white text-[#E8603C] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="vd: nguyenvana_chef"
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email của bạn"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C] transition-colors placeholder-gray-300"
                />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                {tab === 'login' && (
                  <button type="button" onClick={() => setForgotStep('email')}
                    className="text-sm font-semibold text-[#E8603C] hover:underline">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C] transition-colors placeholder-gray-300"
              />
            </div>

            {tab === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    rememberMe ? 'bg-[#E8603C] border-[#E8603C]' : 'border-gray-300'
                  }`}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-1"

            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Đang xử lý...
                </>
              ) : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 whitespace-nowrap">hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Tiếp tục với Google
          </button>

          {/* Switch tab link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {tab === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="text-[#E8603C] font-semibold hover:underline"
            >
              {tab === 'login' ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-6 max-w-xs">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <span className="text-[#E8603C] cursor-pointer hover:underline">Điều khoản dịch vụ</span>{' '}
          và{' '}
          <span className="text-[#E8603C] cursor-pointer hover:underline">Chính sách bảo mật</span>.
        </p>

        {forgotStep && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[380px]">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">
                  {forgotStep === 'email' ? '📧' : forgotStep === 'otp' ? '🔢' : '🔑'}
                </div>
                <h3 className="font-bold text-xl text-[#1a1a2e]">
                  {forgotStep === 'email' && 'Quên mật khẩu'}
                  {forgotStep === 'otp' && 'Nhập mã OTP'}
                  {forgotStep === 'reset' && 'Mật khẩu mới'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {forgotStep === 'email' && 'Nhập email để nhận mã OTP'}
                  {forgotStep === 'otp' && `Mã 6 số đã gửi tới ${forgotEmail}`}
                  {forgotStep === 'reset' && 'Đặt mật khẩu mới cho tài khoản'}
                </p>
              </div>

              {/* Step: email */}
              {forgotStep === 'email' && (
                <div className="space-y-4">
                  <input type="email" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
                  <button onClick={handleForgotSendOtp} disabled={loading}
                    className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-70">
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </button>
                </div>
              )}

              {/* Step: otp */}
              {forgotStep === 'otp' && (
                <div className="space-y-4">
                  <input type="text" value={otpValue} maxLength={6}
                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập mã 6 số"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
                  <button onClick={handleVerifyOtp} disabled={loading}
                    className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-70">
                    {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </button>
                  <button onClick={handleForgotSendOtp} disabled={loading}
                    className="w-full text-sm text-gray-400 hover:text-[#E8603C] transition-colors">
                    Gửi lại mã
                  </button>
                </div>
              )}

              {/* Step: reset */}
              {forgotStep === 'reset' && (
                <div className="space-y-4">
                  <input type="password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới (8+ ký tự, 1 chữ hoa, 1 số)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8603C]/30 focus:border-[#E8603C]" />
                  <button onClick={handleResetPassword} disabled={loading}
                    className="w-full bg-[#E8603C] hover:bg-[#d4522f] text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-70">
                    {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              )}

              {/* Cancel */}
              <button onClick={() => { setForgotStep(null); setOtpValue(''); setNewPassword('') }}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
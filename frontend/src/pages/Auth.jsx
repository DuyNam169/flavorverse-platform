import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/index.js'
import { MOCK_USER } from '../data/mockData.js'

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleGoogleLogin = () => {
    // In production: redirect to /api/auth/google
    login(MOCK_USER)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🍜</div>
          <h1 className="font-display text-4xl font-bold text-primary mb-2">FlavorVerse</h1>
          <p className="text-gray-500">Mạng xã hội công thức nấu ăn thông minh</p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            ['🤖', 'AI gợi ý thực đơn theo thời tiết & vị trí'],
            ['🔀', 'Fork & tùy biến công thức kiểu GitHub'],
            ['📅', 'Lên kế hoạch ăn uống cả tuần tự động'],
            ['🌍', 'Khám phá ẩm thực từ khắp thế giới'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <button onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 font-semibold text-gray-700 hover:border-primary hover:shadow-md transition-all duration-200 active:scale-95 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng nhập với Google
        </button>

        <p className="text-center text-xs text-gray-400">
          Bằng cách đăng nhập, bạn đồng ý với <span className="text-primary cursor-pointer hover:underline">Điều khoản dịch vụ</span> của chúng tôi.
        </p>
      </div>
    </div>
  )
}

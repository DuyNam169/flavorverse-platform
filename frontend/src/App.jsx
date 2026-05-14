import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/common/Navbar.jsx'
import Home from './pages/Home.jsx'
import Discover from './pages/Discover.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import RecipeCreate from './pages/RecipeCreate.jsx'
import MealPlanner from './pages/MealPlanner.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import Auth from './pages/Auth.jsx'
import { useAuthStore } from './store/index.js'
import api from './api/index.js'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const { login } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    // Tự động restore session khi reload
    api.get('/auth/me')
      .then(res => login(res.data.data))
      .catch(() => {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('refresh_token')
      })
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#FFF8F0', border: '1px solid #E8603C22', color: '#2C1A0E', borderRadius: '1rem', fontFamily: 'Nunito, sans-serif' },
        success: { iconTheme: { primary: '#E8603C', secondary: '#FFF8F0' } }
      }} />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><Layout><Discover /></Layout></ProtectedRoute>} />
        <Route path="/recipe/create" element={<ProtectedRoute><Layout><RecipeCreate /></Layout></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><Layout><RecipeDetail /></Layout></ProtectedRoute>} />
        <Route path="/recipe/:id/edit" element={<ProtectedRoute><Layout><RecipeCreate /></Layout></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><Layout><MealPlanner /></Layout></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-400">
            <span className="text-5xl">🍜</span>
            <p className="font-semibold">Trang không tồn tại</p>
            <a href="/" className="text-[#E8603C] text-sm hover:underline">Về trang chủ</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Calendar, User, Plus, Search, Bell } from 'lucide-react'
import { Avatar } from './index.jsx'
import { useAuthStore } from '../../store/index.js'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const active = (path) => location.pathname === path ? 'text-primary' : 'text-gray-400'

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/discover', icon: Compass, label: 'Khám phá' },
    { path: '/planner', icon: Calendar, label: 'Thực đơn' },
    { path: `/profile/${user?.id}`, icon: User, label: 'Tôi' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQ)}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-3 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍜</span>
          <span className="font-display text-xl font-bold text-primary">FlavorVerse</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công thức, nguyên liệu..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border border-orange-100"
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.slice(0, 3).map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-primaryLight hover:text-primary ${active(path)}`}>
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
          <Link to="/recipe/create" className="ml-2 flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primaryDark transition-colors">
            <Plus size={16} />
            <span>Tạo mới</span>
          </Link>
          <button className="ml-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-background relative">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Link to={`/profile/${user?.id}`} className="ml-1">
            <Avatar src={user?.avatar_url} name={user?.display_name} size="sm" />
          </Link>
        </div>
      </nav>

      {/* Mobile bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-orange-100 flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${active(path)}`}>
            <Icon size={22} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
        <Link to="/recipe/create" className="flex flex-col items-center gap-0.5 p-2 text-primary">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center -mt-5 shadow-lg">
            <Plus size={22} />
          </div>
        </Link>
      </nav>

      {/* Top padding spacer for desktop */}
      <div className="hidden md:block h-[60px]" />
      {/* Bottom padding spacer for mobile */}
      <div className="md:hidden h-[65px]" />
    </>
  )
}

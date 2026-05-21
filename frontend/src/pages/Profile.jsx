import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Settings, UserPlus, UserCheck, GitFork, Bookmark, ChefHat } from 'lucide-react'
import { Button, Avatar, Badge } from '../components/common/index.jsx'
import { RecipeCard } from '../components/recipe/RecipeCard.jsx'
import { useAuthStore } from '../store/index.js'
import { userApi, recipeApi } from '../api/index.js'
import api from '../api/index.js'
import toast from 'react-hot-toast'

const TABS = ['Công thức', 'Đã lưu', 'Fork của tôi']

function DefaultAvatar({ email, size = 64 }) {
  const letter = (email || 'U')[0].toUpperCase()
  const px = size
  return (
    <div style={{ width: px, height: px }}
      className="rounded-full bg-[#E8603C] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
      {letter}
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()

  const [profileUser, setProfileUser] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Công thức')
  const [following, setFollowing] = useState(false)

  const isMe = id === currentUser?.id?.toString() || id === 'me'
  const resolvedId = isMe ? currentUser?.id : id

  useEffect(() => {
    if (!resolvedId) return
    setLoading(true)
    Promise.all([
      api.get(`/users/${resolvedId}/profile`),
      api.get(`/users/${resolvedId}/recipes`),
      api.get(`/users/${resolvedId}/saved`),
    ])
      .then(([profileRes, recipesRes, savedRes]) => {
        setProfileUser(profileRes.data.data)
        setRecipes(recipesRes.data.data || [])
        setSavedRecipes(savedRes.data.data || [])
      })
      .catch(() => toast.error('Không thể tải thông tin người dùng'))
      .finally(() => setLoading(false))
  }, [resolvedId])

  const handleFollow = async () => {
    try {
      if (following) {
        await userApi.unfollow(resolvedId)
      } else {
        await userApi.follow(resolvedId)
      }
      setFollowing(!following)
    } catch {
      toast.error('Thao tác thất bại')
    }
  }

  const forkedRecipes = recipes.filter(r => r.forkedFromId)

  const tabContent = {
    'Công thức': recipes,
    'Đã lưu': savedRecipes,
    'Fork của tôi': forkedRecipes,
  }[tab] || []

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-3">🍜</div>
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    </div>
  )

  if (!profileUser) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-5xl mb-3">😕</p>
        <p className="font-bold text-lg">Không tìm thấy người dùng</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Cover & avatar */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-[#E8603C] via-orange-400 to-[#C0392B]" />
        <div className="absolute -bottom-10 left-5">
          <div className="ring-4 ring-white rounded-full">
            {profileUser.avatarUrl ? (
              <img src={profileUser.avatarUrl} alt="avatar"
                className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <DefaultAvatar email={profileUser.email} size={80} />
            )}
          </div>
        </div>
        {isMe && (
          <Link to="/settings" className="absolute top-4 right-4">
            <div className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Settings size={18} />
            </div>
          </Link>
        )}
      </div>

      <div className="px-4 pt-14">
        {/* Name & bio */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{profileUser.displayName || profileUser.username}</h1>
            <p className="text-gray-500 text-sm">@{profileUser.username}</p>
            {profileUser.location && (
              <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={13} /> {profileUser.location}
              </p>
            )}
          </div>
          {!isMe && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                following
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-[#E8603C] text-white hover:bg-[#d4522f]'
              }`}
            >
              {following ? <><UserCheck size={14} /> Đang follow</> : <><UserPlus size={14} /> Follow</>}
            </button>
          )}
        </div>

        {profileUser.bio && <p className="text-sm text-gray-600 mb-4">{profileUser.bio}</p>}

        {/* Diet & health badges — chỉ hiện với profile của mình */}
        {isMe && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
              🥗 {profileUser.dietType === 'normal' ? 'Ăn bình thường'
                : profileUser.dietType === 'vegetarian' ? 'Chay'
                : profileUser.dietType === 'vegan' ? 'Thuần chay'
                : profileUser.dietType === 'keto' ? 'Keto'
                : profileUser.dietType}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              🎯 {profileUser.calorieGoal} kcal/ngày
            </span>
            {profileUser.allergyTags?.length > 0 && profileUser.allergyTags.map(t => (
              <span key={t.name}
                className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
                ⚠️ {t.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <ChefHat size={18} />, value: profileUser.recipeCount ?? 0,    label: 'Công thức' },
            { icon: <UserCheck size={18} />, value: profileUser.followersCount ?? 0, label: 'Followers' },
            { icon: <GitFork size={18} />,   value: profileUser.followingCount ?? 0, label: 'Following' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="flex justify-center text-[#E8603C] mb-1">{s.icon}</div>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t ? 'border-[#E8603C] text-[#E8603C]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tabContent.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            {tabContent.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-lg font-bold mb-1">Chưa có gì ở đây</p>
            <p className="text-gray-500 text-sm">
              {tab === 'Công thức' ? 'Hãy tạo công thức đầu tiên!'
               : tab === 'Đã lưu' ? 'Lưu những công thức bạn yêu thích!'
               : 'Fork công thức từ cộng đồng để bắt đầu!'}
            </p>
            {tab === 'Công thức' && isMe && (
              <Link to="/recipe/create">
                <button className="mt-4 bg-[#E8603C] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#d4522f] transition-colors">
                  Tạo công thức
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Settings, UserPlus, UserCheck, GitFork, Bookmark, ChefHat } from 'lucide-react'
import { Button, Avatar, Badge } from '../components/common/index.jsx'
import { RecipeCard } from '../components/recipe/RecipeCard.jsx'
import { useRecipeStore, useAuthStore } from '../store/index.js'
import { MOCK_USER } from '../data/mockData.js'

const TABS = ['Công thức', 'Đã lưu', 'Fork của tôi']

export default function Profile() {
  const { id } = useParams()
  const { recipes, savedIds } = useRecipeStore()
  const { user: currentUser } = useAuthStore()
  const [tab, setTab] = useState('Công thức')
  const [following, setFollowing] = useState(false)

  const isMe = id === currentUser?.id || id === 'me'
  const profileUser = isMe ? MOCK_USER : {
    ...MOCK_USER,
    username: 'chef_hanoi',
    display_name: 'Chef Hà Nội',
    avatar_url: 'https://i.pravatar.cc/100?img=1',
    bio: 'Đầu bếp chuyên nghiệp, yêu ẩm thực truyền thống 🍲',
    followers_count: 1240,
    following_count: 312,
    recipe_count: 28,
  }

  const myRecipes = recipes.filter(r => r.author?.id === (isMe ? 'me' : 'u1'))
  const savedRecipes = recipes.filter(r => savedIds.includes(r.id))
  const forkedRecipes = recipes.filter(r => r.forked_from_id)

  const tabContent = {
    'Công thức': myRecipes.length > 0 ? myRecipes : recipes.slice(0, 6),
    'Đã lưu': savedRecipes,
    'Fork của tôi': forkedRecipes,
  }[tab]

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Cover & avatar */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-primary via-orange-400 to-secondary" />
        <div className="absolute -bottom-10 left-5">
          <div className="ring-4 ring-white rounded-full">
            <Avatar src={profileUser.avatar_url} name={profileUser.display_name} size="xl" />
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
            <h1 className="font-display text-2xl font-bold">{profileUser.display_name}</h1>
            <p className="text-gray-500 text-sm">@{profileUser.username}</p>
            {profileUser.location && (
              <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={13} /> {profileUser.location}
              </p>
            )}
          </div>
          {!isMe && (
            <Button
              variant={following ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setFollowing(!following)}
            >
              {following ? <><UserCheck size={14} /> Đang follow</> : <><UserPlus size={14} /> Follow</>}
            </Button>
          )}
        </div>

        {profileUser.bio && <p className="text-sm text-gray-600 mb-4">{profileUser.bio}</p>}

        {/* Diet & health badges */}
        {isMe && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge color="green">🥗 {profileUser.diet_type === 'normal' ? 'Ăn bình thường' : profileUser.diet_type}</Badge>
            <Badge color="blue">🎯 {profileUser.calorie_goal} kcal/ngày</Badge>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <ChefHat size={18} />, value: profileUser.recipe_count, label: 'Công thức' },
            { icon: <UserCheck size={18} />, value: profileUser.followers_count, label: 'Followers' },
            { icon: <GitFork size={18} />, value: profileUser.following_count, label: 'Following' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <div className="flex justify-center text-primary mb-1">{s.icon}</div>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tabContent.length > 0 ? (
          <div className="masonry-grid">
            {tabContent.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-display text-lg font-bold mb-1">Chưa có gì ở đây</p>
            <p className="text-gray-500 text-sm">
              {tab === 'Công thức' ? 'Hãy tạo công thức đầu tiên!' :
               tab === 'Đã lưu' ? 'Lưu những công thức bạn yêu thích!' :
               'Fork công thức từ cộng đồng để bắt đầu!'}
            </p>
            {tab === 'Công thức' && isMe && (
              <Link to="/recipe/create"><Button className="mt-4">Tạo công thức</Button></Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

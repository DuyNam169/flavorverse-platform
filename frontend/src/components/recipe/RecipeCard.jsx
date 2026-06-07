import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GitFork, Clock, Bookmark, BookmarkCheck, Pencil, Trash2 } from 'lucide-react'
import { StarRating, DifficultyBadge, Avatar, Badge } from '../common/index.jsx'
import { useRecipeStore } from '../../store/index.js'
import { recipeApi } from '../../api/index.js'
import toast from 'react-hot-toast'

export function RecipeCard({ recipe, compact = false, isOwner = false, onDeleted }) {
  const { savedIds, toggleSave } = useRecipeStore()
  const navigate = useNavigate()
  const isSaved = savedIds.includes(recipe.id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const flagMap = { VN: '🇻🇳', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', IT: '🇮🇹', MX: '🇲🇽', CN: '🇨🇳', SG: '🇸🇬', FR: '🇫🇷' }
  const flag = flagMap[recipe.countryCode] || '🌍'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await recipeApi.delete(recipe.id)
      toast.success('Đã xóa công thức')
      setConfirmDelete(false)
      onDeleted?.(recipe.id)
    } catch {
      toast.error('Xóa thất bại')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="card masonry-item overflow-hidden group relative">
        <Link to={`/recipe/${String(recipe.id).trim()}`} className="block relative overflow-hidden">
          <img
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ aspectRatio: compact ? '4/3' : undefined }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="text-lg">{flag}</span>
            {recipe.forkedFromId && <Badge color="blue">🔀 Fork</Badge>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleSave(recipe.id) }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
          >
            {isSaved
              ? <BookmarkCheck size={16} className="text-primary fill-primary" />
              : <Bookmark size={16} className="text-gray-600" />}
          </button>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>

          {/* Owner actions — edit & delete */}
          {isOwner && (
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/recipe/${String(recipe.id).trim()}/edit`)
                }}
                className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm"
                title="Sửa công thức"
              >
                <Pencil size={13} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setConfirmDelete(true)
                }}
                className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-sm"
                title="Xóa công thức"
              >
                <Trash2 size={13} className="text-gray-700 group-hover/delete:text-white" />
              </button>
            </div>
          )}
        </Link>

        <div className="p-3">
          <Link to={`/recipe/${String(recipe.id).trim()}`}>
            <h3 className="font-display font-bold text-textMain leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>
          {!compact && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{recipe.description}</p>}
          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.tags?.slice(0, 2).map(tag => (
              <span key={tag.name || tag}
                className="text-xs px-2 py-0.5 bg-background rounded-full text-gray-500">
                #{tag.name || tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <StarRating rating={recipe.avgRating} count={recipe.ratingCount} />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-0.5"><Clock size={11} />{recipe.cookTimeMinutes}p</span>
              <span className="flex items-center gap-0.5"><GitFork size={11} />{recipe.forkCount}</span>
            </div>
          </div>
          <Link to={`/profile/${String(recipe.author?.id).trim()}`} className="flex items-center gap-1.5 mt-2 group/author">
            {recipe.author?.avatarUrl
              ? <img src={recipe.author.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
              : <div className="w-5 h-5 rounded-full bg-[#E8603C] flex items-center justify-center text-white text-xs font-bold">
                  {(recipe.author?.email || recipe.author?.username || 'U')[0].toUpperCase()}
                </div>}
            <span className="text-xs text-gray-500 group-hover/author:text-primary transition-colors">
              @{recipe.author?.username}
            </span>
          </Link>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-bold text-lg mb-1">Xóa công thức?</h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc muốn xóa <span className="font-semibold text-gray-700">"{recipe.title}"</span>?
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function RecipeCardHorizontal({ recipe }) {
  const { savedIds, toggleSave } = useRecipeStore()
  const isSaved = savedIds.includes(recipe.id)

  return (
    <Link to={`/recipe/${String(recipe.id).trim()}`} className="card flex gap-3 p-3 group">
      <img
        src={recipe.thumbnailUrl}
        alt={recipe.title}
        className="w-24 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
        <StarRating rating={recipe.avgRating} count={recipe.ratingCount} />
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <Clock size={11} />{recipe.cookTimeMinutes}p
          <span>·</span>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>
      </div>
      <button onClick={(e) => { e.preventDefault(); toggleSave(recipe.id) }} className="self-start p-1">
        {isSaved
          ? <BookmarkCheck size={18} className="text-primary fill-primary" />
          : <Bookmark size={18} className="text-gray-300" />}
      </button>
    </Link>
  )
}
import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, GitFork, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import { StarRating, DifficultyBadge, Avatar, Badge } from '../common/index.jsx'
import { useRecipeStore } from '../../store/index.js'

export function RecipeCard({ recipe, compact = false }) {
  const { savedIds, toggleSave } = useRecipeStore()
  const isSaved = savedIds.includes(recipe.id)

  const flagMap = { VN: '🇻🇳', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', IT: '🇮🇹', MX: '🇲🇽', CN: '🇨🇳', SG: '🇸🇬', FR: '🇫🇷' }
  const flag = flagMap[recipe.country_code] || '🌍'

  return (
    <div className="card masonry-item overflow-hidden group">
      {/* Thumbnail */}
      <Link to={`/recipe/${recipe.id}`} className="block relative overflow-hidden">
        <img
          src={recipe.thumbnail_url}
          alt={recipe.title}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ aspectRatio: compact ? '4/3' : undefined, height: compact ? undefined : 'auto' }}
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="text-lg">{flag}</span>
          {recipe.forked_from_id && <Badge color="blue">🔀 Fork</Badge>}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(recipe.id) }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
        >
          {isSaved
            ? <BookmarkCheck size={16} className="text-primary fill-primary" />
            : <Bookmark size={16} className="text-gray-600" />
          }
        </button>

        {/* Difficulty */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="font-display font-bold text-textMain leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {!compact && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{recipe.description}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-background rounded-full text-gray-500">{tag}</span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <StarRating rating={recipe.avg_rating} count={recipe.rating_count} />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Clock size={11} />{recipe.cook_time_minutes}p</span>
            <span className="flex items-center gap-0.5"><GitFork size={11} />{recipe.fork_count}</span>
          </div>
        </div>

        {/* Author */}
        <Link to={`/profile/${recipe.author?.id}`} className="flex items-center gap-1.5 mt-2 group/author">
          <Avatar src={recipe.author?.avatar_url} name={recipe.author?.display_name} size="sm" />
          <span className="text-xs text-gray-500 group-hover/author:text-primary transition-colors">@{recipe.author?.username}</span>
        </Link>
      </div>
    </div>
  )
}

export function RecipeCardHorizontal({ recipe }) {
  const { savedIds, toggleSave } = useRecipeStore()
  const isSaved = savedIds.includes(recipe.id)

  return (
    <Link to={`/recipe/${recipe.id}`} className="card flex gap-3 p-3 group">
      <img
        src={recipe.thumbnail_url}
        alt={recipe.title}
        className="w-24 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
        <StarRating rating={recipe.avg_rating} count={recipe.rating_count} />
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <Clock size={11} />{recipe.cook_time_minutes}p
          <span>·</span>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); toggleSave(recipe.id) }}
        className="self-start p-1"
      >
        {isSaved
          ? <BookmarkCheck size={18} className="text-primary fill-primary" />
          : <Bookmark size={18} className="text-gray-300" />
        }
      </button>
    </Link>
  )
}

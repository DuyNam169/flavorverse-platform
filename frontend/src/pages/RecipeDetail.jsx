import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, BookmarkCheck, GitFork, Share2, Clock, Users, ChefHat, Star, Camera, AlertTriangle, Loader2 } from 'lucide-react'
import { Button, Badge, Avatar, StarRating, DifficultyBadge } from '../components/common/index.jsx'
import { useAuthStore } from '../store/index.js'
import { recipeApi } from '../api/index.js'

const TABS = ['Nguyên liệu', 'Cách làm', 'Dinh dưỡng', 'Đánh giá']

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuthStore()

  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('Nguyên liệu')
  const [activeStep, setActiveStep] = useState(null)

  // Review form state
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  // Save/unsave state
  const [savingToggle, setSavingToggle] = useState(false)

  // Validate id format (simple UUID v4-ish check) to avoid calling API with malformed ids
  const isValidUUID = (s) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(s).trim())

  // ── Fetch recipe detail ───────────────────────────────────
  const fetchRecipe = useCallback(async () => {
    if (!isValidUUID(id)) {
      setLoading(false)
      setError('ID công thức không hợp lệ')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await recipeApi.getById(id)
      setRecipe(res.data)
    } catch (e) {
      setError('Không tìm thấy công thức hoặc có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }, [id])

  // ── Fetch reviews ─────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    try {
      const res = await recipeApi.getReviews(id)
      // API trả về list hoặc PageResponse — handle cả hai
      setReviews(Array.isArray(res.data) ? res.data : res.data.content ?? [])
    } catch {
      setReviews([])
    }
  }, [id])

  // ── Fetch saved IDs của user hiện tại ────────────────────
  const fetchSavedIds = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return
    try {
      const res = await recipeApi.getSavedIds?.() // nếu có endpoint riêng
      // Nếu không có endpoint getSavedIds, dùng userApi.getSaved
      if (res?.data) setSavedIds(res.data.map(String))
    } catch {
      // Không critical — bỏ qua
    }
  }, [isLoggedIn, user?.id])

  useEffect(() => {
    fetchRecipe()
    fetchReviews()
    fetchSavedIds()
  }, [fetchRecipe, fetchReviews, fetchSavedIds])

  // ── Toggle save ───────────────────────────────────────────
  const handleToggleSave = async () => {
    if (!isLoggedIn) return
    const isSaved = savedIds.includes(String(recipe.id))
    setSavingToggle(true)
    try {
      if (isSaved) {
        await recipeApi.unsave(recipe.id)
        setSavedIds(prev => prev.filter(s => s !== String(recipe.id)))
        setRecipe(prev => ({ ...prev, saveCount: Math.max(0, (prev.saveCount ?? 1) - 1) }))
      } else {
        await recipeApi.save(recipe.id)
        setSavedIds(prev => [...prev, String(recipe.id)])
        setRecipe(prev => ({ ...prev, saveCount: (prev.saveCount ?? 0) + 1 }))
      }
    } catch {
      // Tuỳ chọn: hiển thị toast lỗi
    } finally {
      setSavingToggle(false)
    }
  }

  // ── Fork ──────────────────────────────────────────────────
  const handleFork = async () => {
    if (!isLoggedIn) return
    try {
      await recipeApi.fork(recipe.id)
      setRecipe(prev => ({ ...prev, forkCount: (prev.forkCount ?? 0) + 1 }))
    } catch {
      // Tuỳ chọn: hiển thị toast lỗi
    }
  }

  // ── Submit review ─────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!userRating || !isLoggedIn) return
    setSubmittingReview(true)
    setReviewError(null)
    try {
      await recipeApi.addReview(id, { rating: userRating, comment: reviewText })
      setUserRating(0)
      setReviewText('')
      await fetchReviews()
      await fetchRecipe() // cập nhật avgRating, ratingCount
    } catch (e) {
      setReviewError(e?.response?.data?.message || 'Bạn đã đánh giá công thức này rồi.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // ── Loading / Error ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-4">{error || 'Không tìm thấy công thức'}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    )
  }

  const isSaved = savedIds.includes(String(recipe.id))

  // Nutrition macros — dùng đúng field từ DTO (BigDecimal → number)
  const macros = [
    { label: 'Protein', value: Number(recipe.proteinG ?? 0), unit: 'g', max: 50, color: 'bg-blue-400' },
    { label: 'Carbs',   value: Number(recipe.carbsG   ?? 0), unit: 'g', max: 80, color: 'bg-yellow-400' },
    { label: 'Fat',     value: Number(recipe.fatG     ?? 0), unit: 'g', max: 40, color: 'bg-orange-400' },
    { label: 'Fiber',   value: Number(recipe.fiberG   ?? 0), unit: 'g', max: 15, color: 'bg-green-400' },
  ]

  // avgRating là BigDecimal từ Java → về JS là string hoặc number
  const avgRating   = Number(recipe.avgRating ?? 0)
  const ratingCount = recipe.ratingCount ?? 0

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Hero image */}
      <div className="relative">
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title}
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isLoggedIn && (
            <button
              onClick={handleToggleSave}
              disabled={savingToggle}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60"
            >
              {isSaved
                ? <BookmarkCheck size={20} className="text-primary fill-primary" />
                : <Bookmark size={20} />}
            </button>
          )}
          <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">{recipe.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating rating={avgRating} count={ratingCount} />
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.forkedFromId && <Badge color="blue">🔀 Forked</Badge>}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: <Clock size={18} />,   label: 'Chuẩn bị', value: `${recipe.prepTimeMinutes ?? 0}p` },
            { icon: <ChefHat size={18} />, label: 'Nấu',      value: `${recipe.cookTimeMinutes ?? 0}p` },
            { icon: <Users size={18} />,   label: 'Khẩu phần', value: recipe.servings ?? '-' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <div className="flex justify-center text-primary mb-1">{s.icon}</div>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Author */}
        <div className="card p-3 flex items-center justify-between mb-4">
          <Link to={`/profile/${recipe.author?.id}`} className="flex items-center gap-3 group">
            <Avatar src={recipe.author?.avatarUrl} name={recipe.author?.displayName} />
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                {recipe.author?.displayName}
              </p>
              <p className="text-xs text-gray-500">@{recipe.author?.username}</p>
            </div>
          </Link>
          {isLoggedIn && (
            <Button size="sm" variant="secondary" onClick={handleFork}>
              <GitFork size={14} /> Fork ({recipe.forkCount ?? 0})
            </Button>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
        )}

        {/* Tags — TagDto: { id, name, slug } */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {recipe.tags.map(tag => (
              <span
                key={tag.id}
                className="text-xs px-3 py-1 bg-background rounded-full text-gray-600 border border-orange-100"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab: Nguyên liệu ── */}
        {tab === 'Nguyên liệu' && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Cho {recipe.servings} người ăn</p>
            {(!recipe.ingredients || recipe.ingredients.length === 0) ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có nguyên liệu</p>
            ) : (
              <div className="space-y-2">
                {/* Sort theo orderIndex nếu có */}
                {[...recipe.ingredients]
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50"
                    >
                      <span className="font-medium text-sm">
                        {ing.name}
                        {ing.note && <span className="text-xs text-gray-400 ml-1">({ing.note})</span>}
                        {ing.isOptional && <span className="text-xs text-gray-400 ml-1">[tuỳ chọn]</span>}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {Number(ing.amount)} {ing.unit}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Cách làm ── */}
        {tab === 'Cách làm' && (
          <div className="space-y-4">
            {(!recipe.steps || recipe.steps.length === 0) ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có hướng dẫn</p>
            ) : (
              [...recipe.steps]
                .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
                .map((step, i) => (
                  <div
                    key={step.id}
                    className={`card p-4 border-l-4 transition-all cursor-pointer ${
                      activeStep === i ? 'border-primary shadow-md' : 'border-transparent'
                    }`}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          activeStep === i ? 'bg-primary text-white' : 'bg-primaryLight text-primary'
                        }`}
                      >
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        {step.title && <h4 className="font-semibold mb-1">{step.title}</h4>}
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.timer && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-orange-50 text-primary px-2 py-1 rounded-full">
                            <Clock size={12} /> {step.timer} phút
                          </div>
                        )}
                        {step.imageUrl && (
                          <img
                            src={step.imageUrl}
                            alt={`Bước ${step.stepNumber}`}
                            className="mt-2 rounded-xl w-full object-cover max-h-48"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── Tab: Dinh dưỡng ── */}
        {tab === 'Dinh dưỡng' && (
          <div>
            <div className="card p-5 mb-4 text-center bg-gradient-to-br from-orange-50 to-white">
              <p className="text-4xl font-bold text-primary">{recipe.caloriesPerServing ?? '—'}</p>
              <p className="text-gray-500 text-sm">kcal / khẩu phần</p>
            </div>
            <div className="space-y-3 mb-4">
              {macros.map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{m.label}</span>
                    <span className="font-bold">{m.value}{m.unit}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-3 flex items-start gap-2 border border-yellow-200 bg-yellow-50">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                Giá trị dinh dưỡng được AI ước tính, có thể thay đổi tùy nguyên liệu thực tế.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Đánh giá ── */}
        {tab === 'Đánh giá' && (
          <div>
            {/* Rating summary */}
            <div className="card p-4 flex items-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{avgRating.toFixed(1)}</p>
                <StarRating rating={avgRating} />
                <p className="text-xs text-gray-400 mt-1">{ratingCount} đánh giá</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span>{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-400 w-5 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Write review — chỉ hiển thị nếu đã đăng nhập */}
            {isLoggedIn ? (
              <div className="card p-4 mb-5">
                <h4 className="font-semibold mb-3">Viết đánh giá của bạn</h4>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setUserRating(s)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {s <= userRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm nấu ăn của bạn..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  rows={3}
                />
                {reviewError && (
                  <p className="text-xs text-red-500 mt-1">{reviewError}</p>
                )}
                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    disabled={!userRating}
                    loading={submittingReview}
                    onClick={handleSubmitReview}
                  >
                    Gửi đánh giá
                  </Button>
                </div>
              </div>
            ) : (
              <div className="card p-4 mb-5 text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary font-semibold">Đăng nhập</Link> để viết đánh giá
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có đánh giá nào</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar
                        src={review.user?.avatarUrl}
                        name={review.user?.displayName}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-sm">{review.user?.displayName}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }, (_, i) => (
                            <span key={i} className="text-secondary text-xs">★</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
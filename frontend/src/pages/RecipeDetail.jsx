import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, BookmarkCheck, GitFork, Share2, Clock, Users, ChefHat, Star, Camera, AlertTriangle } from 'lucide-react'
import { Button, Badge, Avatar, StarRating, DifficultyBadge } from '../components/common/index.jsx'
import { useRecipeStore, useAuthStore } from '../store/index.js'

const MOCK_INGREDIENTS = {
  '1': [
    { name: 'Xương bò', amount: 1, unit: 'kg', note: 'Rửa sạch' },
    { name: 'Thịt bò tái', amount: 300, unit: 'g' },
    { name: 'Bánh phở', amount: 600, unit: 'g' },
    { name: 'Hành tây', amount: 2, unit: 'củ', note: 'Nướng thơm' },
    { name: 'Gừng', amount: 1, unit: 'nhánh', note: 'Nướng thơm' },
    { name: 'Quế', amount: 2, unit: 'thanh' },
    { name: 'Hoa hồi', amount: 5, unit: 'cái' },
    { name: 'Nước mắm', amount: 3, unit: 'tbsp' },
    { name: 'Muối', amount: 1, unit: 'tsp' },
    { name: 'Hành lá, rau thơm', amount: 1, unit: 'bó' },
  ]
}

const MOCK_STEPS = {
  '1': [
    { step_number: 1, title: 'Làm sạch xương', description: 'Luộc xương bò với nước sôi 5 phút, vớt ra rửa sạch để loại bỏ tạp chất.', timer_seconds: 300 },
    { step_number: 2, title: 'Nướng thơm hành gừng', description: 'Nướng hành tây và gừng trên lửa to đến khi có mùi thơm và hơi cháy xém bề mặt. Rửa sạch lại.', timer_seconds: 600 },
    { step_number: 3, title: 'Hầm nước dùng', description: 'Cho xương vào nồi với 3 lít nước, thêm hành gừng, quế, hoa hồi. Hầm lửa nhỏ 3-4 tiếng, vớt bọt thường xuyên.', timer_seconds: 10800 },
    { step_number: 4, title: 'Nêm gia vị', description: 'Nêm nước mắm, muối, đường cho vừa ăn. Lọc nước dùng qua rây.', timer_seconds: null },
    { step_number: 5, title: 'Trần bánh phở', description: 'Trần bánh phở trong nước sôi, cho vào tô. Xếp thịt bò tái lên trên, chan nước dùng nóng.', timer_seconds: null },
    { step_number: 6, title: 'Hoàn thiện & dọn ăn', description: 'Thêm hành lá, rau thơm, giá đỗ. Ăn kèm tương đen, tương ớt theo khẩu vị.', timer_seconds: null },
  ]
}

const MOCK_REVIEWS = [
  { id: 'r1', user: { display_name: 'Lan Anh', avatar_url: 'https://i.pravatar.cc/40?img=11' }, rating: 5, comment: 'Ngon tuyệt! Nước dùng trong và thơm lắm. Đã làm theo công thức này mấy lần rồi, lần nào cũng thành công.', created_at: '2024-01-15' },
  { id: 'r2', user: { display_name: 'Minh Tuấn', avatar_url: 'https://i.pravatar.cc/40?img=12' }, rating: 4, comment: 'Công thức rõ ràng, dễ làm theo. Lần đầu nấu phở tại nhà mà được khen ngon!', created_at: '2024-01-12' },
  { id: 'r3', user: { display_name: 'Thu Hương', avatar_url: 'https://i.pravatar.cc/40?img=13' }, rating: 5, comment: 'Tuyệt vời! Cảm ơn tác giả đã chia sẻ bí quyết hầm xương.', created_at: '2024-01-10' },
]

const TABS = ['Nguyên liệu', 'Cách làm', 'Dinh dưỡng', 'Đánh giá']

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipes, savedIds, toggleSave } = useRecipeStore()
  const { user } = useAuthStore()
  const [tab, setTab] = useState('Nguyên liệu')
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [activeStep, setActiveStep] = useState(null)

  const recipe = recipes.find(r => r.id === id) || recipes[0]
  if (!recipe) return <div className="text-center py-20">Không tìm thấy công thức</div>

  const isSaved = savedIds.includes(recipe.id)
  const ingredients = MOCK_INGREDIENTS[id] || MOCK_INGREDIENTS['1']
  const steps = MOCK_STEPS[id] || MOCK_STEPS['1']

  const macros = [
    { label: 'Protein', value: recipe.protein_g, unit: 'g', max: 50, color: 'bg-blue-400' },
    { label: 'Carbs', value: recipe.carbs_g, unit: 'g', max: 80, color: 'bg-yellow-400' },
    { label: 'Fat', value: recipe.fat_g, unit: 'g', max: 40, color: 'bg-orange-400' },
    { label: 'Fiber', value: recipe.fiber_g || 4, unit: 'g', max: 15, color: 'bg-green-400' },
  ]

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Hero image */}
      <div className="relative">
        <img src={recipe.thumbnail_url} alt={recipe.title} className="w-full h-64 md:h-96 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <ArrowLeft size={20} />
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => toggleSave(recipe.id)} className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            {isSaved ? <BookmarkCheck size={20} className="text-primary fill-primary" /> : <Bookmark size={20} />}
          </button>
          <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">{recipe.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating rating={recipe.avg_rating} count={recipe.rating_count} />
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.forked_from_id && <Badge color="blue">🔀 Forked</Badge>}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: <Clock size={18} />, label: 'Chuẩn bị', value: `${recipe.prep_time_minutes}p` },
            { icon: <ChefHat size={18} />, label: 'Nấu', value: `${recipe.cook_time_minutes}p` },
            { icon: <Users size={18} />, label: 'Khẩu phần', value: recipe.servings },
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
            <Avatar src={recipe.author?.avatar_url} name={recipe.author?.display_name} />
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">{recipe.author?.display_name}</p>
              <p className="text-xs text-gray-500">@{recipe.author?.username}</p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              <GitFork size={14} /> Fork ({recipe.fork_count})
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {recipe.tags?.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 bg-background rounded-full text-gray-600 border border-orange-100">{tag}</span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Nguyên liệu' && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Cho {recipe.servings} người ăn</p>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="font-medium text-sm">{ing.name} {ing.note && <span className="text-xs text-gray-400">({ing.note})</span>}</span>
                  <span className="text-sm font-semibold text-primary">{ing.amount} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Cách làm' && (
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className={`card p-4 border-l-4 transition-all ${activeStep === i ? 'border-primary shadow-md' : 'border-transparent'}`}
                onClick={() => setActiveStep(activeStep === i ? null : i)}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${activeStep === i ? 'bg-primary text-white' : 'bg-primaryLight text-primary'}`}>
                    {step.step_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.timer_seconds && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs bg-orange-50 text-primary px-2 py-1 rounded-full">
                        <Clock size={12} /> {Math.round(step.timer_seconds / 60)} phút
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Dinh dưỡng' && (
          <div>
            <div className="card p-5 mb-4 text-center bg-gradient-to-br from-orange-50 to-white">
              <p className="text-4xl font-bold text-primary">{recipe.calories_per_serving}</p>
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
                    <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-3 flex items-start gap-2 border border-yellow-200 bg-yellow-50">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">Giá trị dinh dưỡng được AI ước tính, có thể thay đổi tùy nguyên liệu thực tế.</p>
            </div>
          </div>
        )}

        {tab === 'Đánh giá' && (
          <div>
            {/* Rating summary */}
            <div className="card p-4 flex items-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{recipe.avg_rating}</p>
                <StarRating rating={recipe.avg_rating} />
                <p className="text-xs text-gray-400 mt-1">{recipe.rating_count} đánh giá</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span>{star}★</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 3}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Write review */}
            <div className="card p-4 mb-5">
              <h4 className="font-semibold mb-3">Viết đánh giá của bạn</h4>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setUserRating(s)} className="text-2xl transition-transform hover:scale-110">
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
              <div className="flex justify-between items-center mt-3">
                <button className="text-sm text-gray-500 flex items-center gap-1 hover:text-primary">
                  <Camera size={14} /> Thêm ảnh
                </button>
                <Button size="sm" disabled={!userRating}>Gửi đánh giá</Button>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar src={review.user.avatar_url} name={review.user.display_name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm">{review.user.display_name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }, (_, i) => <span key={i} className="text-secondary text-xs">★</span>)}
                        <span className="text-xs text-gray-400 ml-1">{review.created_at}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

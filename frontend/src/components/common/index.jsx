import React from 'react'
import { Loader2 } from 'lucide-react'

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'border-2 border-primary text-primary hover:bg-primaryLight',
    ghost: 'text-primary hover:bg-primaryLight',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5', lg: 'px-7 py-3 text-lg' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Badge({ children, color = 'primary', className = '' }) {
  const colors = {
    primary: 'bg-primaryLight text-primary',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[color]} ${className}`}>{children}</span>
}

export function Avatar({ src, name, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${sizes[size]} rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export function StarRating({ rating, count, size = 'sm' }) {
  const starSize = size === 'sm' ? 14 : 18
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F5A623' : '#E5E7EB'}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{rating?.toFixed(1)} {count ? `(${count})` : ''}</span>
    </div>
  )
}

export function DifficultyBadge({ difficulty }) {
  const map = { easy: ['Dễ', 'green'], medium: ['Vừa', 'yellow'], hard: ['Khó', 'red'] }
  const [label, color] = map[difficulty] || ['Vừa', 'yellow']
  return <Badge color={color}>{label}</Badge>
}

export function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-bounce-in">
        {title && (
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action}
    </div>
  )
}

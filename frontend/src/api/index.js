import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || '/ai',
  headers: { 'Content-Type': 'application/json' },
})

// Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const recipeApi = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  fork: (id) => api.post(`/recipes/${id}/fork`),
  search: (q) => api.get('/recipes/search', { params: { q } }),
  discover: (params) => api.get('/recipes/discover', { params }),
  save: (id) => api.post(`/recipes/${id}/save`),
  unsave: (id) => api.delete(`/recipes/${id}/save`),
  getReviews: (id) => api.get(`/recipes/${id}/reviews`),
  addReview: (id, data) => api.post(`/recipes/${id}/reviews`, data),
}

export const plannerApi = {
  getWeek: (weekStart) => api.get('/planner', { params: { week_start: weekStart } }),
  addMeal: (data) => api.post('/planner/meals', data),
  removeMeal: (slotId) => api.delete(`/planner/meals/${slotId}`),
  getShoppingList: (planId) => api.get(`/planner/${planId}/shopping-list`),
}

export const aiApiClient = {
  nutrition: (data) => aiApi.post('/nutrition', data),
  suggest: (data) => aiApi.post('/suggest', data),
  generatePlan: (data) => aiApi.post('/planner/generate', data),
  chat: (data) => aiApi.post('/chat', data),
}

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  getSaved: (id) => api.get(`/users/${id}/saved`),
  getFeed: () => api.get('/users/me/feed'),
}

export default api

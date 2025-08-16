import axios from 'axios'

// Auto-detect API URL for Vercel deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) 
    ? `${window.location.origin}/api` 
    : '/api'  // Use proxy in development

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for cold starts
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add language preference header
    const language = localStorage.getItem('language') || 'en'
    config.headers['Accept-Language'] = language
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData)
}

export const surveyAPI = {
  getAll: (params) => api.get('/surveys', { params }),
  getById: (id, params) => api.get(`/surveys/${id}`, { params }),
  getQuestions: (id) => api.get(`/surveys/${id}/questions`),
  getStats: (id) => api.get(`/surveys/${id}/stats`),
  create: (surveyData) => api.post('/surveys', surveyData),
  update: (id, surveyData) => api.put(`/surveys/${id}`, surveyData),
  delete: (id) => api.delete(`/surveys/${id}`)
}

export const resultAPI = {
  submit: (resultData) => api.post('/results', resultData),
  getUserResults: (params) => api.get('/results', { params }),
  getById: (id) => api.get(`/results/${id}`),
  compare: (id1, id2) => api.get(`/results/${id1}/compare/${id2}`),
  export: (id, format = 'json') => api.get(`/results/${id}/export`, { 
    params: { format },
    responseType: format === 'pdf' ? 'blob' : 'json'
  })
}

export const userAPI = {
  getDashboard: () => api.get('/users/dashboard')
}

export default api
import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import { authStorage } from '@/services/localStorage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authStorage.getUser(),
    token: authStorage.getToken(),
    isAuthenticated: !!authStorage.getToken(),
    loading: false,
    coldStartLoading: false, // Always start as false
    error: null,
    requestStartTime: null
  }),

  getters: {
    fullName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.username
    },
    
    initials: (state) => {
      if (!state.user) return ''
      if (state.user.firstName || state.user.lastName) {
        return `${state.user.firstName?.[0] || ''}${state.user.lastName?.[0] || ''}`.toUpperCase()
      }
      return state.user.username?.[0]?.toUpperCase() || ''
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      this.requestStartTime = Date.now()

      // Show cold start loader if request takes longer than 1 second
      const coldStartTimer = setTimeout(() => {
        this.coldStartLoading = true
      }, 1000)

      try {
        const response = await authAPI.login(credentials)
        clearTimeout(coldStartTimer)
        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true

        authStorage.setToken(token)
        authStorage.setUser(user)

        return { success: true, user }
      } catch (error) {
        clearTimeout(coldStartTimer)
        console.error('Login error:', error)
        
        if (error.code === 'ECONNABORTED') {
          this.error = 'Request timeout. Please try again.'
        } else if (error.code === 'ERR_NETWORK') {
          this.error = 'Network error. Please check your connection.'
        } else if (error.response?.status === 401) {
          this.error = error.response?.data?.error || 'Invalid email or password'
        } else if (error.response?.status === 500) {
          this.error = 'Server error. Please try again later.'
        } else {
          this.error = error.response?.data?.error || error.message || 'Login failed'
        }
        
        return { success: false, error: this.error }
      } finally {
        this.loading = false
        this.coldStartLoading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.register(userData)
        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true

        authStorage.setToken(token)
        authStorage.setUser(user)

        return { success: true, user }
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      if (!this.isAuthenticated) return

      try {
        const response = await authAPI.getProfile()
        this.user = response.data.user
        authStorage.setUser(this.user)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        if (error.response?.status === 401) {
          this.logout()
        }
      }
    },

    async updateProfile(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.updateProfile(userData)
        this.user = response.data.user
        authStorage.setUser(this.user)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Profile update failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async changePassword(passwordData) {
      this.loading = true
      this.error = null

      try {
        await authAPI.changePassword(passwordData)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Password change failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      authStorage.clearAuth()
    },

    clearError() {
      this.error = null
    },

    clearColdStart() {
      this.coldStartLoading = false
    }
  }
})
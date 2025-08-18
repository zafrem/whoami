export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading from localStorage:`, error)
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error writing to localStorage:`, error)
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing from localStorage:`, error)
    }
  },

  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn(`Error clearing localStorage:`, error)
    }
  }
}

export const surveyStorage = {
  getSurveyProgress(surveyId) {
    return storage.get(`survey_progress_${surveyId}`, {
      currentQuestion: 0,
      answers: {},
      startTime: null,
      lastUpdated: null
    })
  },

  setSurveyProgress(surveyId, progress) {
    storage.set(`survey_progress_${surveyId}`, {
      ...progress,
      lastUpdated: new Date().toISOString()
    })
  },

  removeSurveyProgress(surveyId) {
    storage.remove(`survey_progress_${surveyId}`)
  },

  getAllSurveyProgress() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('survey_progress_')) {
        keys.push(key)
      }
    }
    return keys.map(key => ({
      key,
      surveyId: key.replace('survey_progress_', ''),
      data: storage.get(key)
    }))
  },

  clearAllSurveyProgress() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('survey_progress_')) {
        keys.push(key)
      }
    }
    keys.forEach(key => storage.remove(key))
    return keys.length
  }
}

export const authStorage = {
  getToken() {
    return localStorage.getItem('auth_token')
  },

  setToken(token) {
    localStorage.setItem('auth_token', token)
  },

  removeToken() {
    localStorage.removeItem('auth_token')
  },

  getUser() {
    return storage.get('user')
  },

  setUser(user) {
    storage.set('user', user)
  },

  removeUser() {
    storage.remove('user')
  },

  getLoginTime() {
    return storage.get('login_time')
  },

  setLoginTime(time) {
    storage.set('login_time', time)
  },

  removeLoginTime() {
    storage.remove('login_time')
  },

  clearAuth() {
    this.removeToken()
    this.removeUser()
    this.removeLoginTime()
  }
}
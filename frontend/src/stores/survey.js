import { defineStore } from 'pinia'
import { surveyAPI, resultAPI } from '@/services/api'
import { surveyStorage } from '@/services/localStorage'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    surveys: [],
    currentSurvey: null,
    currentQuestions: null,
    currentProgress: {
      currentQuestion: 0,
      answers: {},
      startTime: null
    },
    results: null,
    userResults: [],
    loading: false,
    error: null,
    _activeSurveyRequest: null, // Cache for active survey request
    _lastSurveyFetch: null // Timestamp of last successful fetch
  }),

  getters: {
    progressPercentage: (state) => {
      if (!state.currentQuestions?.questions) return 0
      return Math.round((Object.keys(state.currentProgress.answers).length / state.currentQuestions.questions.length) * 100)
    },

    isCompleted: (state) => {
      if (!state.currentQuestions?.questions) return false
      return Object.keys(state.currentProgress.answers).length === state.currentQuestions.questions.length
    },

    // timeSpent removed - calculated in component to avoid constant reactivity
  },

  actions: {
    async fetchSurveys(params = {}, forceRefresh = false) {
      // Create cache key from params
      const cacheKey = JSON.stringify(params)
      const now = Date.now()
      
      // Return cached data if recent (within 5 seconds) and not forcing refresh
      if (!forceRefresh && 
          this._lastSurveyFetch && 
          (now - this._lastSurveyFetch) < 5000 && 
          this.surveys.length > 0) {
        return this.surveys
      }

      // If there's already an active request with the same params, wait for it
      if (this._activeSurveyRequest && this._activeSurveyRequest.cacheKey === cacheKey) {
        try {
          return await this._activeSurveyRequest.promise
        } catch (error) {
          // If the cached request failed, continue with a new request
        }
      }

      this.loading = true
      this.error = null

      // Create and cache the promise
      const requestPromise = this._performSurveyRequest(params)
      this._activeSurveyRequest = {
        cacheKey,
        promise: requestPromise
      }

      try {
        const result = await requestPromise
        this._lastSurveyFetch = now
        return result
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch surveys'
        console.error('Fetch surveys error:', error)
        throw error
      } finally {
        this.loading = false
        this._activeSurveyRequest = null
      }
    },

    async _performSurveyRequest(params) {
      const response = await surveyAPI.getAll(params)
      this.surveys = response.data
      return response.data
    },

    async fetchSurvey(id, includeQuestions = false) {
      // If we already have this survey loaded, return it
      if (this.currentSurvey && this.currentSurvey.id === id) {
        return this.currentSurvey
      }

      this.loading = true
      this.error = null

      try {
        const response = await surveyAPI.getById(id, { includeQuestions })
        this.currentSurvey = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch survey'
        console.error('Fetch survey error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSurveyQuestions(id, type = 'full') {
      this.loading = true
      this.error = null

      try {
        const response = await surveyAPI.getQuestions(id, type)
        this.currentQuestions = response.data
        
        // Create a unique key that includes survey type for progress storage
        const progressKey = type === 'full' ? id : `${id}-${type}`
        const savedProgress = surveyStorage.getSurveyProgress(progressKey)
        
        if (savedProgress.startTime) {
          this.currentProgress = savedProgress
        } else {
          this.currentProgress = {
            currentQuestion: 0,
            answers: {},
            startTime: new Date().toISOString(),
            surveyType: type
          }
          surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch survey questions'
        console.error('Fetch survey questions error:', error)
      } finally {
        this.loading = false
      }
    },

    updateAnswer(questionId, answer) {
      this.currentProgress.answers[questionId] = answer
      
      if (this.currentSurvey) {
        const surveyType = this.currentProgress.surveyType || 'full'
        const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
        surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
      }
    },

    nextQuestion() {
      if (this.currentProgress.currentQuestion < (this.currentQuestions?.questions?.length || 0) - 1) {
        this.currentProgress.currentQuestion++
        
        if (this.currentSurvey) {
          const surveyType = this.currentProgress.surveyType || 'full'
          const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
          surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
        }
      }
    },

    previousQuestion() {
      if (this.currentProgress.currentQuestion > 0) {
        this.currentProgress.currentQuestion--
        
        if (this.currentSurvey) {
          const surveyType = this.currentProgress.surveyType || 'full'
          const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
          surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
        }
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < (this.currentQuestions?.questions?.length || 0)) {
        this.currentProgress.currentQuestion = index
        
        if (this.currentSurvey) {
          const surveyType = this.currentProgress.surveyType || 'full'
          const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
          surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
        }
      }
    },

    async submitSurvey(sessionId = null, timeSpent = 0) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.submit({
          surveyId: this.currentSurvey.id,
          answers: this.currentProgress.answers,
          timeSpent: timeSpent,
          sessionId
        })
        
        this.results = response.data
        
        if (this.currentSurvey) {
          const surveyType = this.currentProgress.surveyType || 'full'
          const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
          surveyStorage.removeSurveyProgress(progressKey)
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to submit survey'
        console.error('Submit survey error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitExternalSurvey(surveyId, sessionId = null) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.submit({
          surveyId: surveyId,
          answers: {}, // External surveys don't have internal answers
          timeSpent: 0, // External surveys don't track time internally
          sessionId,
          isExternal: true
        })
        
        this.results = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to submit external survey'
        console.error('Submit external survey error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserResults(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.getUserResults(params)
        this.userResults = response.data.results
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch user results'
        console.error('Fetch user results error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchResult(id) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.getById(id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch result'
        console.error('Fetch result error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async compareResults(id1, id2) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.compare(id1, id2)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to compare results'
        console.error('Compare results error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async exportResult(id, format = 'json') {
      try {
        const response = await resultAPI.export(id, format)
        return response.data
      } catch (error) {
        console.error('Export result error:', error)
        throw error
      }
    },

    async refreshSurveys(params = {}) {
      return await this.fetchSurveys(params, true)
    },

    resetCurrentSurvey() {
      this.currentSurvey = null
      this.currentQuestions = null
      this.currentProgress = {
        currentQuestion: 0,
        answers: {},
        startTime: null
      }
      this.results = null
    },

    resetAnswers() {
      this.currentProgress.answers = {}
      this.currentProgress.currentQuestion = 0
      
      if (this.currentSurvey) {
        const surveyType = this.currentProgress.surveyType || 'full'
        const progressKey = surveyType === 'full' ? this.currentSurvey.id : `${this.currentSurvey.id}-${surveyType}`
        surveyStorage.setSurveyProgress(progressKey, this.currentProgress)
      }
    },

    clearError() {
      this.error = null
    }
  }
})
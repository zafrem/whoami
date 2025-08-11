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
    error: null
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

    timeSpent: (state) => {
      if (!state.currentProgress.startTime) return 0
      return Math.floor((Date.now() - new Date(state.currentProgress.startTime).getTime()) / 1000)
    }
  },

  actions: {
    async fetchSurveys(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await surveyAPI.getAll(params)
        this.surveys = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch surveys'
        console.error('Fetch surveys error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSurvey(id, includeQuestions = false) {
      this.loading = true
      this.error = null

      try {
        const response = await surveyAPI.getById(id, { includeQuestions })
        this.currentSurvey = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch survey'
        console.error('Fetch survey error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSurveyQuestions(id) {
      this.loading = true
      this.error = null

      try {
        const response = await surveyAPI.getQuestions(id)
        this.currentQuestions = response.data
        
        const savedProgress = surveyStorage.getSurveyProgress(id)
        if (savedProgress.startTime) {
          this.currentProgress = savedProgress
        } else {
          this.currentProgress = {
            currentQuestion: 0,
            answers: {},
            startTime: new Date().toISOString()
          }
          surveyStorage.setSurveyProgress(id, this.currentProgress)
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
        surveyStorage.setSurveyProgress(this.currentSurvey.id, this.currentProgress)
      }
    },

    nextQuestion() {
      if (this.currentProgress.currentQuestion < (this.currentQuestions?.questions?.length || 0) - 1) {
        this.currentProgress.currentQuestion++
        
        if (this.currentSurvey) {
          surveyStorage.setSurveyProgress(this.currentSurvey.id, this.currentProgress)
        }
      }
    },

    previousQuestion() {
      if (this.currentProgress.currentQuestion > 0) {
        this.currentProgress.currentQuestion--
        
        if (this.currentSurvey) {
          surveyStorage.setSurveyProgress(this.currentSurvey.id, this.currentProgress)
        }
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < (this.currentQuestions?.questions?.length || 0)) {
        this.currentProgress.currentQuestion = index
        
        if (this.currentSurvey) {
          surveyStorage.setSurveyProgress(this.currentSurvey.id, this.currentProgress)
        }
      }
    },

    async submitSurvey(sessionId = null) {
      this.loading = true
      this.error = null

      try {
        const response = await resultAPI.submit({
          surveyId: this.currentSurvey.id,
          answers: this.currentProgress.answers,
          timeSpent: this.timeSpent,
          sessionId
        })
        
        this.results = response.data
        
        if (this.currentSurvey) {
          surveyStorage.removeSurveyProgress(this.currentSurvey.id)
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

    clearError() {
      this.error = null
    }
  }
})
<template>
  <div class="max-w-4xl mx-auto p-6">
    <div v-if="surveyStore.loading && !currentSurvey" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">{{ t('survey.loading') }}</p>
    </div>

    <div v-else-if="surveyStore.error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ surveyStore.error }}</p>
      <button @click="loadSurvey" class="btn-primary">{{ t('common.retry') }}</button>
    </div>

    <!-- External Survey (iframe) -->
    <div v-else-if="currentSurvey && currentSurvey.isExternal" class="mb-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ getLocalizedText(currentSurvey.name) }}</h1>
        <p class="text-gray-600 mb-4">{{ getLocalizedText(currentSurvey.description) }}</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-800 text-sm">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-10 10"/>
            </svg>
            This survey is hosted externally. Please complete it in the iframe below.
          </p>
        </div>
      </div>
      
      <!-- iframe Container -->
      <div class="relative bg-white rounded-lg shadow-lg overflow-hidden" style="height: 80vh;">
        <iframe
          :src="currentSurvey.externalUrl"
          class="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          loading="lazy"
        ></iframe>
      </div>
      
      <!-- External Survey Actions -->
      <div class="mt-6 text-center">
        <button
          @click="completeExternalSurvey"
          class="btn-primary mr-4"
          :disabled="surveyStore.loading"
        >
          {{ surveyStore.loading ? 'Saving...' : 'Mark as Completed' }}
        </button>
        <button
          @click="openExternalSurvey"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-10 10"/>
          </svg>
          Open in New Tab
        </button>
      </div>
    </div>

    <div v-else-if="currentSurvey && currentQuestions">
      <!-- Survey Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ getLocalizedText(currentSurvey.name) }}</h1>
        <p class="text-gray-600 mb-4">{{ getLocalizedText(currentSurvey.description) }}</p>
        
        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>{{ t('survey.progress') }}</span>
            <span>{{ surveyStore.progressPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${surveyStore.progressPercentage}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ t('survey.questionCount', { current: currentQuestionIndex + 1, total: totalQuestions }) }}</span>
            <span v-if="timeSpent">{{ formatTime(timeSpent) }}</span>
          </div>
        </div>
      </div>

      <!-- Question Navigation -->
      <div v-if="totalQuestions > 1" class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(question, index) in currentQuestions.questions"
            :key="question.id"
            @click="goToQuestion(index)"
            class="w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors"
            :class="getQuestionNavClass(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>

      <!-- Current Question -->
      <div v-if="currentQuestion" class="card mb-6">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ currentQuestion.text }}
          </h2>

          <!-- Scale Questions -->
          <div v-if="currentQuestion.type === 'scale'" class="space-y-3">
            <div
              v-for="option in currentQuestion.options"
              :key="option.value"
              class="flex items-center"
            >
              <input
                :id="`q${currentQuestion.id}_${option.value}`"
                :value="option.value"
                :checked="selectedAnswer === option.value"
                @change="selectAnswer(option.value)"
                type="radio"
                :name="`question_${currentQuestion.id}`"
                class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <label
                :for="`q${currentQuestion.id}_${option.value}`"
                class="ml-3 block text-gray-700 cursor-pointer flex-1 p-2 hover:bg-gray-50 rounded"
              >
                {{ option.text }}
              </label>
            </div>
          </div>

          <!-- Multiple Choice Questions -->
          <div v-else-if="currentQuestion.type === 'choice'" class="space-y-3">
            <button
              v-for="option in currentQuestion.options"
              :key="option.value"
              @click="selectAnswer(option.value)"
              class="w-full text-left p-4 border-2 rounded-lg transition-colors hover:bg-gray-50"
              :class="{
                'border-primary-500 bg-primary-50': selectedAnswer === option.value,
                'border-gray-200': selectedAnswer !== option.value
              }"
            >
              <div class="flex items-center justify-between">
                <span class="text-gray-900">{{ option.text }}</span>
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="{
                    'border-primary-500 bg-primary-500': selectedAnswer === option.value,
                    'border-gray-300': selectedAnswer !== option.value
                  }"
                >
                  <CheckIcon v-if="selectedAnswer === option.value" class="w-3 h-3 text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center">
        <button
          v-if="currentQuestionIndex > 0"
          @click="previousQuestion"
          class="btn-secondary flex items-center"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          {{ t('survey.previous') }}
        </button>
        <div v-else></div>

        <div class="flex space-x-4">
          <button
            v-if="currentQuestionIndex < totalQuestions - 1"
            @click="nextQuestion"
            :disabled="selectedAnswer === null"
            class="btn-primary flex items-center"
            :class="{ 'opacity-50 cursor-not-allowed': selectedAnswer === null }"
          >
            {{ t('survey.next') }}
            <ArrowRightIcon class="w-4 h-4 ml-2" />
          </button>

          <button
            v-if="surveyStore.isCompleted"
            @click="submitSurvey"
            :disabled="surveyStore.loading"
            class="btn-primary bg-green-600 hover:bg-green-700 flex items-center"
          >
            <span v-if="surveyStore.loading" class="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ surveyStore.loading ? t('survey.submitting') : t('survey.submitSurvey') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Registration Prompt Modal -->
    <div v-if="showRegistrationPrompt" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('survey.saveResults.title') }}</h3>
        <p class="text-gray-600 mb-6">
          {{ t('survey.saveResults.description') }}
        </p>
        
        <div class="flex space-x-4">
          <router-link
            to="/register"
            class="flex-1 btn-primary text-center"
          >
            {{ t('survey.saveResults.createAccount') }}
          </router-link>
          <button
            @click="viewResultsAsGuest"
            class="flex-1 btn-secondary"
          >
            {{ t('survey.saveResults.viewResults') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useSurveyStore } from '@/stores/survey'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const surveyStore = useSurveyStore()

const showRegistrationPrompt = ref(false)
const timeInterval = ref(null)

const currentSurvey = computed(() => surveyStore.currentSurvey)
const currentQuestions = computed(() => surveyStore.currentQuestions)
const currentQuestionIndex = computed(() => surveyStore.currentProgress.currentQuestion)
const totalQuestions = computed(() => currentQuestions.value?.questions?.length || 0)

const currentQuestion = computed(() => {
  if (!currentQuestions.value?.questions) return null
  return currentQuestions.value.questions[currentQuestionIndex.value]
})

const selectedAnswer = computed(() => {
  if (!currentQuestion.value) return null
  return surveyStore.currentProgress.answers[currentQuestion.value.id] ?? null
})

const timeSpent = computed(() => surveyStore.timeSpent)

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getQuestionNavClass = (index) => {
  const isAnswered = surveyStore.currentProgress.answers[currentQuestions.value.questions[index].id] !== undefined
  const isCurrent = index === currentQuestionIndex.value
  
  if (isCurrent) {
    return 'border-primary-600 bg-primary-600 text-white'
  } else if (isAnswered) {
    return 'border-green-500 bg-green-50 text-green-700'
  } else {
    return 'border-gray-300 bg-white text-gray-500'
  }
}

const loadSurvey = async () => {
  try {
    // First try to load the survey as requested
    await surveyStore.fetchSurvey(props.id)
    
    // If successful and we have a baseId, check if there's a version in the current language
    if (surveyStore.currentSurvey?.baseId) {
      const currentLanguage = locale.value
      
      // If the loaded survey is not in the current language, try to find the correct language version
      if (surveyStore.currentSurvey.language !== currentLanguage) {
        await surveyStore.fetchSurveys({ active: 'true' })
        const languageSpecificSurvey = surveyStore.surveys.find(s => 
          s.baseId === surveyStore.currentSurvey.baseId && s.language === currentLanguage
        )
        
        if (languageSpecificSurvey && languageSpecificSurvey.id !== props.id) {
          // Redirect to the correct language version
          router.replace({ name: 'SurveyTake', params: { id: languageSpecificSurvey.id } })
          return
        }
      }
    }
    
    // Load the questions for the survey
    await surveyStore.fetchSurveyQuestions(props.id)
  } catch (error) {
    console.error('Failed to load survey:', error)
  }
}

// Note: loadSurveyForLanguage removed - language switching now handled via page refresh

const selectAnswer = (value) => {
  if (currentQuestion.value) {
    surveyStore.updateAnswer(currentQuestion.value.id, value)
  }
}

const nextQuestion = () => {
  if (selectedAnswer.value !== null) {
    surveyStore.nextQuestion()
  }
}

const previousQuestion = () => {
  surveyStore.previousQuestion()
}

const goToQuestion = (index) => {
  surveyStore.goToQuestion(index)
}

const submitSurvey = async () => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const result = await surveyStore.submitSurvey(authStore.isAuthenticated ? null : sessionId)
    
    if (result.needsRegistration) {
      showRegistrationPrompt.value = true
      localStorage.setItem('pendingResult', JSON.stringify({
        resultId: result.resultId,
        sessionId: sessionId
      }))
    } else {
      router.push({ name: 'SurveyResult', params: { id: result.resultId } })
    }
  } catch (error) {
    console.error('Failed to submit survey:', error)
    window.showNotification('error', t('survey.submissionFailed'), t('survey.tryAgain'))
  }
}

// External survey methods
const completeExternalSurvey = async () => {
  try {
    const sessionId = `external_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const result = await surveyStore.submitExternalSurvey(props.id, authStore.isAuthenticated ? null : sessionId)
    
    if (result.needsRegistration) {
      showRegistrationPrompt.value = true
      localStorage.setItem('pendingResult', JSON.stringify({
        resultId: result.resultId,
        sessionId: sessionId
      }))
    } else {
      router.push({ name: 'SurveyResult', params: { id: result.resultId } })
    }
  } catch (error) {
    console.error('Failed to mark external survey as completed:', error)
    window.showNotification('error', 'Failed to save completion', 'Please try again.')
  }
}

const openExternalSurvey = () => {
  if (currentSurvey.value?.externalUrl) {
    window.open(currentSurvey.value.externalUrl, '_blank', 'noopener,noreferrer')
  }
}

// Helper function to get localized text
const getLocalizedText = (textObj) => {
  if (!textObj) return ''
  if (typeof textObj === 'string') return textObj
  if (typeof textObj === 'object') {
    return textObj[locale.value] || textObj['en'] || textObj[Object.keys(textObj)[0]] || ''
  }
  return ''
}

const viewResultsAsGuest = () => {
  const pendingResult = JSON.parse(localStorage.getItem('pendingResult') || '{}')
  if (pendingResult.resultId) {
    router.push({ name: 'SurveyResult', params: { id: pendingResult.resultId } })
  }
  showRegistrationPrompt.value = false
}

const startTimeTracking = () => {
  timeInterval.value = setInterval(() => {
    // Force reactivity update
    surveyStore.currentProgress.startTime = surveyStore.currentProgress.startTime || new Date().toISOString()
  }, 1000)
}

const stopTimeTracking = () => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
    timeInterval.value = null
  }
}

// Auto-save progress
watch(() => surveyStore.currentProgress.answers, () => {
  // Progress is automatically saved in the store
}, { deep: true })

// Note: Language changes are now handled via page refresh in LanguageSwitcher
// This ensures clean state reset and proper loading in the new language

onMounted(async () => {
  await loadSurvey()
  startTimeTracking()
})

onUnmounted(() => {
  stopTimeTracking()
})
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Loading your results...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="loadResult" class="btn-primary">Retry</button>
    </div>

    <div v-else-if="result">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Your {{ surveyName }} Results</h1>
        <p class="text-gray-600 mb-4">{{ surveyDescription }}</p>
        <div class="text-sm text-gray-500">
          Completed on {{ formatDate(result.completedAt) }}
          <span v-if="result.timeSpent"> • Time taken: {{ formatTime(result.timeSpent) }}</span>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="result.resultsJson.summary" class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <p class="text-gray-700 leading-relaxed">{{ result.resultsJson.summary }}</p>
      </div>

      <!-- Scores Visualization -->
      <div v-if="result.resultsJson.scores" class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Dimension Scores</h2>
        
        <div class="space-y-6">
          <div
            v-for="(score, dimension) in result.resultsJson.scores"
            :key="dimension"
            class="space-y-2"
          >
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-900">{{ formatDimensionName(dimension) }}</span>
              <span class="text-gray-600">{{ score }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-500"
                :class="getScoreColor(score)"
                :style="{ width: `${score}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="result.resultsJson.results" class="space-y-6 mb-8">
        <div
          v-for="(dimensionResult, dimension) in result.resultsJson.results"
          :key="dimension"
          class="card"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ formatDimensionName(dimension) }}</h3>
            <div class="text-right">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {{ dimensionResult.category.toUpperCase() }}
              </span>
              <div class="text-sm text-gray-500 mt-1">{{ dimensionResult.score }}%</div>
            </div>
          </div>
          
          <p class="text-gray-700 mb-4">{{ dimensionResult.description }}</p>
          
          <div v-if="dimensionResult.traits && dimensionResult.traits.length" class="flex flex-wrap gap-2">
            <span
              v-for="trait in dimensionResult.traits"
              :key="trait"
              class="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
            >
              {{ trait }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="exportResult"
          class="btn-secondary flex items-center justify-center"
        >
          <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
          Export Results
        </button>
        
        <button
          @click="shareResult"
          class="btn-secondary flex items-center justify-center"
        >
          <ShareIcon class="w-4 h-4 mr-2" />
          Share Results
        </button>

        <router-link
          v-if="authStore.isAuthenticated"
          to="/results"
          class="btn-primary flex items-center justify-center"
        >
          <ChartBarIcon class="w-4 h-4 mr-2" />
          View All Results
        </router-link>

        <router-link
          v-else
          to="/register"
          class="btn-primary flex items-center justify-center"
        >
          <UserPlusIcon class="w-4 h-4 mr-2" />
          Save Results
        </router-link>
      </div>

      <!-- Recommendations -->
      <div class="mt-12 card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900">Explore More Surveys</h3>
            <p class="text-gray-600 text-sm">Discover other aspects of your personality with our complementary assessments.</p>
            <router-link to="/" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
              Browse Surveys →
            </router-link>
          </div>
          
          <div v-if="!authStore.isAuthenticated" class="space-y-3">
            <h3 class="font-medium text-gray-900">Track Your Growth</h3>
            <p class="text-gray-600 text-sm">Create an account to save your results and compare them over time.</p>
            <router-link to="/register" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
              Create Account →
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <h3 class="font-medium text-gray-900">Compare Results</h3>
            <p class="text-gray-600 text-sm">See how your personality has evolved by comparing with previous results.</p>
            <router-link to="/results" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View History →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  DocumentArrowDownIcon,
  ShareIcon,
  ChartBarIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useSurveyStore } from '@/stores/survey'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const authStore = useAuthStore()
const surveyStore = useSurveyStore()
const { locale } = useI18n()

const result = ref(null)
const loading = ref(true)
const error = ref(null)

// Helper function to get localized text
const getLocalizedText = (textObj) => {
  if (typeof textObj === 'string') return textObj
  if (typeof textObj === 'object' && textObj !== null) {
    return textObj[locale.value] || textObj['en'] || Object.values(textObj)[0] || ''
  }
  return String(textObj || '')
}

// Computed properties for localized survey data
const surveyName = computed(() => {
  return result.value ? getLocalizedText(result.value.survey.name) : ''
})

const surveyDescription = computed(() => {
  return result.value ? getLocalizedText(result.value.survey.description) : ''
})

const loadResult = async () => {
  loading.value = true
  error.value = null

  try {
    result.value = await surveyStore.fetchResult(props.id)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load results'
    console.error('Failed to load result:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const formatDimensionName = (dimension) => {
  const names = {
    'EI': 'Extraversion vs Introversion',
    'SN': 'Sensing vs Intuition',
    'TF': 'Thinking vs Feeling',
    'JP': 'Judging vs Perceiving',
    'economic': 'Economic Left/Right',
    'social': 'Social Libertarian/Authoritarian'
  }
  return names[dimension] || dimension.charAt(0).toUpperCase() + dimension.slice(1)
}

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const exportResult = async () => {
  try {
    const response = await surveyStore.exportResult?.(props.id, 'json')
    
    // Create download
    const blob = new Blob([JSON.stringify(result.value, null, 2)], { 
      type: 'application/json' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `survey-result-${props.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    window.showNotification('success', 'Export Successful', 'Your results have been downloaded.')
  } catch (error) {
    console.error('Export failed:', error)
    window.showNotification('error', 'Export Failed', 'Please try again.')
  }
}

const shareResult = async () => {
  const url = window.location.href
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `My ${surveyName.value} Results`,
        text: `Check out my personality assessment results!`,
        url: url
      })
    } catch (error) {
      console.error('Sharing failed:', error)
    }
  } else {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url)
      window.showNotification('success', 'Link Copied', 'Share link copied to clipboard.')
    } catch (error) {
      console.error('Copy failed:', error)
      window.showNotification('error', 'Share Failed', 'Could not copy share link.')
    }
  }
}

onMounted(() => {
  loadResult()
})
</script>
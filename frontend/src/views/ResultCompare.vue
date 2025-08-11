<template>
  <div class="max-w-6xl mx-auto p-6">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Loading comparison...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="loadComparison" class="btn-primary">Retry</button>
    </div>

    <div v-else-if="comparison">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Result Comparison</h1>
            <p class="text-gray-600">{{ comparison.survey }}</p>
          </div>
          <router-link to="/results" class="btn-secondary">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Back to Results
          </router-link>
        </div>
      </div>

      <!-- Comparison Overview -->
      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Earlier Result</h3>
            <p class="text-gray-600 mb-4">{{ formatDate(comparison.result1.completedAt) }}</p>
            
            <div v-if="comparison.result1.results.scores" class="space-y-3">
              <div
                v-for="(score, dimension) in comparison.result1.results.scores"
                :key="dimension"
              >
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium">{{ formatDimensionName(dimension) }}</span>
                  <span>{{ score }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${score}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Later Result</h3>
            <p class="text-gray-600 mb-4">{{ formatDate(comparison.result2.completedAt) }}</p>
            
            <div v-if="comparison.result2.results.scores" class="space-y-3">
              <div
                v-for="(score, dimension) in comparison.result2.results.scores"
                :key="dimension"
              >
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium">{{ formatDimensionName(dimension) }}</span>
                  <span>{{ score }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${score}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Comparison -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Score Changes</h2>
        
        <div class="space-y-6">
          <div
            v-for="(difference, dimension) in comparison.differences"
            :key="dimension"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ formatDimensionName(dimension) }}</h3>
              <div class="flex items-center space-x-4 text-sm">
                <span class="text-blue-600">
                  {{ comparison.result1.results.scores[dimension] }}%
                </span>
                <ArrowRightIcon class="w-4 h-4 text-gray-400" />
                <span class="text-green-600">
                  {{ comparison.result2.results.scores[dimension] }}%
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex-1">
                <div class="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                  <div
                    class="absolute left-0 top-0 h-full bg-blue-500 opacity-50"
                    :style="{ width: `${comparison.result1.results.scores[dimension]}%` }"
                  ></div>
                  <div
                    class="absolute left-0 top-0 h-full bg-green-500 opacity-50"
                    :style="{ width: `${comparison.result2.results.scores[dimension]}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="text-right">
                <div
                  class="flex items-center text-sm font-medium"
                  :class="{
                    'text-green-600': difference.scoreDifference > 0,
                    'text-red-600': difference.scoreDifference < 0,
                    'text-gray-600': difference.scoreDifference === 0
                  }"
                >
                  <span v-if="difference.scoreDifference > 0">+</span>
                  <span>{{ difference.scoreDifference.toFixed(1) }}</span>
                  <ChevronUpIcon v-if="difference.scoreDifference > 0" class="w-4 h-4 ml-1" />
                  <ChevronDownIcon v-else-if="difference.scoreDifference < 0" class="w-4 h-4 ml-1" />
                  <MinusIcon v-else class="w-4 h-4 ml-1" />
                </div>
                <div class="text-xs text-gray-500">
                  {{ difference.percentageChange.toFixed(1) }}% change
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Changes -->
      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Earlier Categories</h3>
          <div class="space-y-3">
            <div
              v-for="(result, dimension) in comparison.result1.results.results"
              :key="dimension"
            >
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div class="font-medium text-gray-900">{{ formatDimensionName(dimension) }}</div>
                  <div class="text-sm text-blue-700">{{ result.category.toUpperCase() }}</div>
                </div>
                <div class="text-sm text-gray-600">{{ result.score }}%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Later Categories</h3>
          <div class="space-y-3">
            <div
              v-for="(result, dimension) in comparison.result2.results.results"
              :key="dimension"
            >
              <div 
                class="flex items-center justify-between p-3 rounded-lg"
                :class="{
                  'bg-green-50': getCategoryChange(dimension) === 'same',
                  'bg-yellow-50': getCategoryChange(dimension) === 'changed'
                }"
              >
                <div>
                  <div class="font-medium text-gray-900">{{ formatDimensionName(dimension) }}</div>
                  <div 
                    class="text-sm"
                    :class="{
                      'text-green-700': getCategoryChange(dimension) === 'same',
                      'text-yellow-700': getCategoryChange(dimension) === 'changed'
                    }"
                  >
                    {{ result.category.toUpperCase() }}
                    <span v-if="getCategoryChange(dimension) === 'changed'" class="ml-1">
                      (Changed!)
                    </span>
                  </div>
                </div>
                <div class="text-sm text-gray-600">{{ result.score }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Key Insights</h2>
        
        <div class="space-y-4">
          <div v-for="insight in insights" :key="insight.type" class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <CheckCircleIcon v-if="insight.type === 'positive'" class="w-5 h-5 text-green-500" />
              <ExclamationTriangleIcon v-else-if="insight.type === 'warning'" class="w-5 h-5 text-yellow-500" />
              <InformationCircleIcon v-else class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="text-gray-900 font-medium">{{ insight.title }}</p>
              <p class="text-gray-600 text-sm">{{ insight.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { useSurveyStore } from '@/stores/survey'

const props = defineProps({
  id1: {
    type: String,
    required: true
  },
  id2: {
    type: String,
    required: true
  }
})

const surveyStore = useSurveyStore()

const comparison = ref(null)
const loading = ref(true)
const error = ref(null)

const insights = computed(() => {
  if (!comparison.value) return []

  const insights = []
  const differences = comparison.value.differences

  // Find significant changes
  const significantChanges = Object.entries(differences).filter(([_, diff]) => 
    Math.abs(diff.scoreDifference) >= 10
  )

  if (significantChanges.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Significant Changes Detected',
      description: `${significantChanges.length} dimension(s) showed changes of 10% or more.`
    })
  }

  // Find category changes
  const categoryChanges = Object.keys(comparison.value.result1.results.results).filter(dimension =>
    getCategoryChange(dimension) === 'changed'
  )

  if (categoryChanges.length > 0) {
    insights.push({
      type: 'positive',
      title: 'Personality Type Shifts',
      description: `Your personality type changed in ${categoryChanges.length} dimension(s), suggesting personal growth.`
    })
  } else {
    insights.push({
      type: 'info',
      title: 'Consistent Personality Type',
      description: 'Your core personality type remained stable, indicating consistent personal traits.'
    })
  }

  // Find improvement trends
  const improvements = Object.values(differences).filter(diff => diff.scoreDifference > 5).length
  const declines = Object.values(differences).filter(diff => diff.scoreDifference < -5).length

  if (improvements > declines) {
    insights.push({
      type: 'positive',
      title: 'Overall Positive Trend',
      description: `More dimensions showed improvement (${improvements}) than decline (${declines}).`
    })
  }

  return insights
})

const getCategoryChange = (dimension) => {
  if (!comparison.value) return 'same'
  
  const cat1 = comparison.value.result1.results.results[dimension]?.category
  const cat2 = comparison.value.result2.results.results[dimension]?.category
  
  return cat1 === cat2 ? 'same' : 'changed'
}

const loadComparison = async () => {
  loading.value = true
  error.value = null

  try {
    comparison.value = await surveyStore.compareResults(props.id1, props.id2)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load comparison'
    console.error('Failed to load comparison:', err)
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

onMounted(() => {
  loadComparison()
})
</script>
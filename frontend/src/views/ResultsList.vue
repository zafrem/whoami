<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Results</h1>
      <p class="text-gray-600">View and compare your personality assessment results</p>
    </div>

    <div v-if="surveyStore.loading && !results.length" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Loading your results...</p>
    </div>

    <div v-else-if="surveyStore.error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ surveyStore.error }}</p>
      <button @click="loadResults" class="btn-primary">Retry</button>
    </div>

    <div v-else-if="results.length === 0" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <DocumentTextIcon class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
      <p class="text-gray-600 mb-6">You haven't completed any surveys yet. Take your first assessment to get started!</p>
      <router-link to="/" class="btn-primary">Browse Surveys</router-link>
    </div>

    <div v-else>
      <!-- Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <select
            v-model="selectedCategory"
            @change="applyFilters"
            class="form-input"
          >
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category.charAt(0).toUpperCase() + category.slice(1) }}
            </option>
          </select>
        </div>
        
        <div class="flex-1">
          <select
            v-model="selectedSurvey"
            @change="applyFilters"
            class="form-input"
          >
            <option value="">All Surveys</option>
            <option
              v-for="survey in surveys"
              :key="survey.id"
              :value="survey.id"
            >
              {{ survey.name }}
            </option>
          </select>
        </div>

        <button
          v-if="selectedResults.length >= 2"
          @click="toggleCompareMode"
          class="btn-secondary whitespace-nowrap"
        >
          {{ compareMode ? 'Cancel Compare' : 'Compare Results' }}
        </button>
      </div>

      <!-- Compare Mode Actions -->
      <div v-if="compareMode && selectedForComparison.length >= 2" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-blue-900">Compare Selected Results</h3>
            <p class="text-sm text-blue-700">{{ selectedForComparison.length }} results selected for comparison</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="compareSelectedResults"
              :disabled="selectedForComparison.length !== 2"
              class="btn-primary text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': selectedForComparison.length !== 2 }"
            >
              Compare ({{ selectedForComparison.length }}/2)
            </button>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="result in displayedResults"
          :key="result.id"
          class="card relative hover:shadow-lg transition-shadow"
          :class="{
            'ring-2 ring-primary-500': compareMode && selectedForComparison.includes(result.id),
            'cursor-pointer': compareMode
          }"
          @click="compareMode ? toggleResultSelection(result) : viewResult(result)"
        >
          <!-- Compare Mode Checkbox -->
          <div v-if="compareMode" class="absolute top-4 right-4">
            <input
              type="checkbox"
              :checked="selectedForComparison.includes(result.id)"
              @change="toggleResultSelection(result)"
              class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div class="mb-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-900 pr-8">{{ result.survey.name }}</h3>
            </div>
            <p class="text-gray-600 text-sm mb-3">{{ result.survey.description }}</p>
            
            <div class="flex items-center text-xs text-gray-500 space-x-4">
              <span class="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                {{ result.survey.category }}
              </span>
              <span>{{ formatDate(result.completedAt) }}</span>
              <span v-if="result.timeSpent">{{ formatTime(result.timeSpent) }}</span>
            </div>
          </div>

          <!-- Result Preview -->
          <div v-if="result.resultsJson.scores" class="mb-4">
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(score, dimension, index) in result.resultsJson.scores"
                :key="dimension"
                v-show="index < 4"
                class="text-center"
              >
                <div class="text-xs text-gray-500 mb-1">{{ formatDimensionName(dimension) }}</div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="getScoreColor(score)"
                    :style="{ width: `${score}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-700 mt-1">{{ score }}%</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="!compareMode" class="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              @click.stop="viewResult(result)"
              class="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View Details
            </button>
            
            <div class="flex space-x-2">
              <button
                @click.stop="exportResult(result)"
                class="text-gray-600 hover:text-gray-900 text-sm"
                title="Export"
              >
                <DocumentArrowDownIcon class="w-4 h-4" />
              </button>
              
              <button
                v-if="canCompareWith(result)"
                @click.stop="findComparisonOptions(result)"
                class="text-gray-600 hover:text-gray-900 text-sm"
                title="Compare"
              >
                <ArrowsRightLeftIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="flex space-x-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="loadPage(page)"
            class="px-3 py-2 text-sm rounded-md"
            :class="{
              'bg-primary-600 text-white': page === currentPage,
              'bg-white text-gray-700 hover:bg-gray-50 border': page !== currentPage
            }"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ArrowsRightLeftIcon
} from '@heroicons/vue/24/outline'
import { useSurveyStore } from '@/stores/survey'

const router = useRouter()
const surveyStore = useSurveyStore()

const results = ref([])
const selectedCategory = ref('')
const selectedSurvey = ref('')
const compareMode = ref(false)
const selectedForComparison = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 6

const categories = computed(() => {
  const cats = [...new Set(results.value.map(r => r.survey.category))]
  return cats.sort()
})

const surveys = computed(() => {
  const uniqueSurveys = results.value.reduce((acc, result) => {
    if (!acc.find(s => s.id === result.survey.id)) {
      acc.push(result.survey)
    }
    return acc
  }, [])
  return uniqueSurveys.sort((a, b) => a.name.localeCompare(b.name))
})

const selectedResults = computed(() => {
  let filtered = [...results.value]

  if (selectedCategory.value) {
    filtered = filtered.filter(r => r.survey.category === selectedCategory.value)
  }

  if (selectedSurvey.value) {
    filtered = filtered.filter(r => r.survey.id === selectedSurvey.value)
  }

  return filtered
})

const displayedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return selectedResults.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const loadResults = async () => {
  try {
    const response = await surveyStore.fetchUserResults({ 
      limit: 100,
      offset: 0 
    })
    results.value = response.results || []
    updatePagination()
  } catch (error) {
    console.error('Failed to load results:', error)
  }
}

const updatePagination = () => {
  totalPages.value = Math.ceil(selectedResults.value.length / itemsPerPage)
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  updatePagination()
}

const loadPage = (page) => {
  currentPage.value = page
}

const viewResult = (result) => {
  if (!compareMode.value) {
    router.push({ name: 'SurveyResult', params: { id: result.id } })
  }
}

const toggleCompareMode = () => {
  compareMode.value = !compareMode.value
  selectedForComparison.value = []
}

const toggleResultSelection = (result) => {
  const index = selectedForComparison.value.indexOf(result.id)
  if (index > -1) {
    selectedForComparison.value.splice(index, 1)
  } else if (selectedForComparison.value.length < 2) {
    selectedForComparison.value.push(result.id)
  }
}

const compareSelectedResults = () => {
  if (selectedForComparison.value.length === 2) {
    const [id1, id2] = selectedForComparison.value
    router.push({ 
      name: 'ResultCompare', 
      params: { id1, id2 } 
    })
  }
}

const canCompareWith = (result) => {
  return results.value.some(r => 
    r.id !== result.id && r.survey.id === result.survey.id
  )
}

const findComparisonOptions = (result) => {
  const sameTypeResults = results.value.filter(r => 
    r.id !== result.id && r.survey.id === result.survey.id
  )
  
  if (sameTypeResults.length > 0) {
    // For simplicity, compare with the most recent same-type result
    const mostRecent = sameTypeResults.sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    )[0]
    
    router.push({ 
      name: 'ResultCompare', 
      params: { id1: result.id, id2: mostRecent.id } 
    })
  }
}

const exportResult = async (result) => {
  try {
    const blob = new Blob([JSON.stringify(result, null, 2)], { 
      type: 'application/json' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.survey.name.replace(/\s+/g, '-').toLowerCase()}-result-${result.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    window.showNotification('success', 'Export Successful', 'Your result has been downloaded.')
  } catch (error) {
    console.error('Export failed:', error)
    window.showNotification('error', 'Export Failed', 'Please try again.')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  return `${mins}m`
}

const formatDimensionName = (dimension) => {
  const names = {
    'EI': 'E/I',
    'SN': 'S/N',
    'TF': 'T/F',
    'JP': 'J/P',
    'economic': 'Econ',
    'social': 'Social'
  }
  return names[dimension] || dimension.substr(0, 4)
}

const getScoreColor = (score) => {
  if (score >= 75) return 'bg-green-500'
  if (score >= 50) return 'bg-blue-500'
  if (score >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

onMounted(() => {
  loadResults()
})
</script>
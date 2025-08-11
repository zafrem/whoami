<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">All Surveys</h1>
      <p class="text-gray-600">Explore our collection of personality assessments</p>
    </div>

    <div v-if="surveyStore.loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="animate-pulse">
        <div class="card">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div class="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <div v-else-if="surveyStore.error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ surveyStore.error }}</p>
      <button @click="loadSurveys" class="btn-primary">Retry</button>
    </div>

    <div v-else>
      <!-- Filters -->
      <div class="mb-8 flex flex-col sm:flex-row gap-4">
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
            v-model="selectedDifficulty"
            @change="applyFilters"
            class="form-input"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div class="flex-1">
          <input
            v-model="searchTerm"
            @input="applyFilters"
            type="text"
            placeholder="Search surveys..."
            class="form-input"
          />
        </div>
      </div>

      <!-- Surveys Grid -->
      <div v-if="filteredSurveys.length === 0" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MagnifyingGlassIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Surveys Found</h3>
        <p class="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
        <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="survey in filteredSurveys"
          :key="survey.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="takeSurvey(survey)"
        >
          <div class="mb-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-xl font-semibold text-gray-900">{{ survey.name }}</h3>
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getDifficultyClass(survey.difficulty)"
              >
                {{ survey.difficulty }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-4 line-clamp-3">{{ survey.description }}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span class="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                {{ survey.category }}
              </span>
              <span v-if="survey.estimatedTime">
                <ClockIcon class="w-4 h-4 inline mr-1" />
                {{ survey.estimatedTime }} min
              </span>
            </div>

            <div v-if="survey.tags && survey.tags.length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in survey.tags.slice(0, 3)"
                :key="tag"
                class="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded"
              >
                {{ tag }}
              </span>
              <span
                v-if="survey.tags.length > 3"
                class="inline-flex items-center px-2 py-1 text-xs text-gray-500"
              >
                +{{ survey.tags.length - 3 }}
              </span>
            </div>
          </div>

          <button class="btn-primary w-full">
            Take Survey
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { useSurveyStore } from '@/stores/survey'

const router = useRouter()
const surveyStore = useSurveyStore()

const selectedCategory = ref('')
const selectedDifficulty = ref('')
const searchTerm = ref('')

const categories = computed(() => {
  const cats = [...new Set(surveyStore.surveys.map(s => s.category))]
  return cats.sort()
})

const filteredSurveys = computed(() => {
  let filtered = [...surveyStore.surveys]

  if (selectedCategory.value) {
    filtered = filtered.filter(s => s.category === selectedCategory.value)
  }

  if (selectedDifficulty.value) {
    filtered = filtered.filter(s => s.difficulty === selectedDifficulty.value)
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term) ||
      s.tags?.some(tag => tag.toLowerCase().includes(term))
    )
  }

  return filtered
})

const loadSurveys = () => {
  surveyStore.fetchSurveys({ active: 'true' })
}

const applyFilters = () => {
  // Filters are applied automatically via computed property
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedDifficulty.value = ''
  searchTerm.value = ''
}

const takeSurvey = (survey) => {
  router.push({ name: 'SurveyTake', params: { id: survey.id } })
}

const getDifficultyClass = (difficulty) => {
  const classes = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
  return classes[difficulty] || classes.medium
}

onMounted(() => {
  loadSurveys()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
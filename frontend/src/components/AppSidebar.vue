<template>
  <aside class="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
    <div class="p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Available Surveys</h2>
      
      <div v-if="surveyStore.loading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <div class="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <div v-else-if="surveyStore.error" class="text-center py-8">
        <p class="text-gray-500 text-sm">{{ surveyStore.error }}</p>
        <button
          @click="loadSurveys"
          class="mt-2 btn-secondary text-xs"
        >
          Retry
        </button>
      </div>

      <div v-else class="space-y-3">
        <div v-if="surveys.length === 0" class="text-center py-8">
          <p class="text-gray-500 text-sm">No surveys available</p>
        </div>

        <div
          v-for="survey in surveys"
          :key="survey.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="selectSurvey(survey)"
        >
          <h3 class="font-medium text-gray-900 mb-1">{{ survey.name }}</h3>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ survey.description }}</p>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span class="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
              {{ survey.category }}
            </span>
            <span v-if="survey.estimatedTime">{{ survey.estimatedTime }}min</span>
          </div>

          <div v-if="survey.tags && survey.tags.length" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in survey.tags.slice(0, 2)"
              :key="tag"
              class="inline-flex items-center px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded"
            >
              {{ tag }}
            </span>
            <span
              v-if="survey.tags.length > 2"
              class="inline-flex items-center px-2 py-0.5 text-xs text-gray-500"
            >
              +{{ survey.tags.length - 2 }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="authStore.isAuthenticated" class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-3">Quick Links</h3>
        <nav class="space-y-1">
          <router-link
            to="/results"
            class="sidebar-item"
            :class="{ active: $route.name === 'ResultsList' }"
          >
            <DocumentTextIcon class="w-4 h-4 mr-2" />
            My Results
          </router-link>
          <router-link
            to="/profile"
            class="sidebar-item"
            :class="{ active: $route.name === 'Profile' }"
          >
            <UserIcon class="w-4 h-4 mr-2" />
            Profile
          </router-link>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentTextIcon, UserIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useSurveyStore } from '@/stores/survey'

const router = useRouter()
const authStore = useAuthStore()
const surveyStore = useSurveyStore()

const surveys = computed(() => surveyStore.surveys || [])

const selectSurvey = (survey) => {
  router.push({ name: 'SurveyTake', params: { id: survey.id } })
}

const loadSurveys = () => {
  // Use refresh for explicit retry actions
  surveyStore.refreshSurveys({ active: 'true' })
}

onMounted(() => {
  // Use cached fetch on mount
  surveyStore.fetchSurveys({ active: 'true' })
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
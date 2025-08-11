<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="animate-fade-in">
        <!-- Main Logo/Image -->
        <div class="mb-8">
          <div 
            class="w-48 h-48 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105 shadow-xl"
            @click="handleMainImageClick"
          >
            <div class="text-center text-white">
              <svg class="w-20 h-20 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
              </svg>
              <span class="text-lg font-semibold">PersonalityHub</span>
            </div>
          </div>
        </div>

        <!-- Welcome Content -->
        <div class="mb-12">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {{ t('home.title') }}
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {{ t('home.subtitle') }}
          </p>

          <!-- Call to Action -->
          <div v-if="!authStore.isAuthenticated" class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/register"
              class="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              {{ t('home.getStartedFree') }}
              <ArrowRightIcon class="w-5 h-5 ml-2" />
            </router-link>
            <button
              @click="scrollToSurveys"
              class="btn-secondary text-lg px-8 py-3"
            >
              {{ t('home.browseSurveys') }}
            </button>
          </div>

          <div v-else class="text-center">
            <p class="text-lg text-gray-700 mb-4">
              {{ t('home.welcomeBack', { name: authStore.fullName }) }}
            </p>
            
            <!-- Admin Button -->
            <div v-if="authStore.user?.role === 'admin'" class="mb-6">
              <router-link
                to="/admin"
                class="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Admin Dashboard
              </router-link>
            </div>
            <router-link
              to="/results"
              class="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              {{ t('home.viewYourResults') }}
              <ArrowRightIcon class="w-5 h-5 ml-2" />
            </router-link>
          </div>
        </div>

        <!-- Features -->
        <div class="grid md:grid-cols-3 gap-8 mb-16" id="features">
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('home.features.scientificAssessment.title') }}</h3>
            <p class="text-gray-600">
              {{ t('home.features.scientificAssessment.description') }}
            </p>
          </div>

          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('home.features.personalInsights.title') }}</h3>
            <p class="text-gray-600">
              {{ t('home.features.personalInsights.description') }}
            </p>
          </div>

          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ClockIcon class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ t('home.features.trackProgress.title') }}</h3>
            <p class="text-gray-600">
              {{ t('home.features.trackProgress.description') }}
            </p>
          </div>
        </div>

        <!-- Popular Surveys -->
        <div id="surveys" class="mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">{{ t('home.popularSurveys') }}</h2>
          
          <div v-if="surveyStore.loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" class="animate-pulse">
              <div class="card">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="survey in featuredSurveys"
              :key="survey.id"
              class="card hover:shadow-lg transition-shadow cursor-pointer"
              @click="takeSurvey(survey)"
            >
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ survey.name }}</h3>
              <p class="text-gray-600 mb-4">{{ survey.description }}</p>
              
              <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span class="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                  {{ survey.category }}
                </span>
                <span v-if="survey.estimatedTime">{{ survey.estimatedTime }} min</span>
              </div>

              <button class="btn-primary w-full">
                {{ t('home.takeSurvey') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useSurveyStore } from '@/stores/survey'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const surveyStore = useSurveyStore()

const featuredSurveys = computed(() => {
  return surveyStore.surveys.slice(0, 6)
})

const handleMainImageClick = () => {
  if (authStore.isAuthenticated) {
    router.push('/results')
  } else {
    scrollToSurveys()
  }
}

const takeSurvey = (survey) => {
  router.push({ name: 'SurveyTake', params: { id: survey.id } })
}

const scrollToSurveys = () => {
  document.getElementById('surveys')?.scrollIntoView({ behavior: 'smooth' })
}

// Note: Language changes are now handled via page refresh in LanguageSwitcher
// This ensures surveys are reloaded in the new language automatically

onMounted(() => {
  surveyStore.fetchSurveys({ active: 'true' })
})
</script>
<template>
  <div class="relative" ref="dropdown">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      :aria-label="t('language.switchLanguage')"
    >
      <GlobeAltIcon class="w-4 h-4" />
      <span class="hidden sm:inline">{{ currentLanguageName }}</span>
      <ChevronDownIcon class="w-3 h-3" />
    </button>

    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <div class="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
        {{ t('language.currentLanguage') }}
      </div>
      
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        :class="{ 'bg-primary-50 text-primary-700 font-medium': currentLocale === lang.code }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
          </div>
          <CheckIcon 
            v-if="currentLocale === lang.code" 
            class="w-4 h-4 text-primary-600"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { GlobeAltIcon, ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { surveyStorage } from '@/services/localStorage'

const { t, locale } = useI18n()
const router = useRouter()

const showDropdown = ref(false)
const dropdown = ref(null)

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷'
  }
]

const currentLocale = computed(() => locale.value)

const currentLanguageName = computed(() => {
  const lang = languages.find(l => l.code === currentLocale.value)
  return lang ? lang.name : 'English'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const changeLanguage = (languageCode) => {
  // Don't change if it's already the current language
  if (locale.value === languageCode) {
    closeDropdown()
    return
  }
  
  locale.value = languageCode
  closeDropdown()
  
  // Show notification (if notification system is available)
  if (window.showNotification) {
    const languageName = languages.find(l => l.code === languageCode)?.name
    window.showNotification('success', t('notifications.success'), t('language.languageChanged', { language: languageName }))
  }
  
  // Language change is handled by the proxy in i18n/index.js which saves to localStorage
  // API will automatically pick up the new language from localStorage on next request
  
  // Clear all survey progress to ensure clean state when language changes
  const clearedCount = surveyStorage.clearAllSurveyProgress()
  console.log(`Cleared ${clearedCount} survey progress entries for language change`)
  
  // Navigate to home page after language change
  setTimeout(() => {
    router.push('/')
  }, 100)
}

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
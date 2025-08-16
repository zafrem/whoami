<template>
  <div class="relative" ref="dropdown">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div 
        class="w-4 h-4 rounded-full mr-2"
        :class="getThemeColor(themeStore.currentTheme)"
      ></div>
      {{ themeStore.getCurrentTheme?.label }}
      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <div
      v-show="isOpen"
      class="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      <div class="py-1">
        <button
          v-for="theme in themeStore.availableThemes"
          :key="theme.name"
          @click="selectTheme(theme.name)"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-primary-50 text-primary-700': theme.name === themeStore.currentTheme }"
        >
          <div 
            class="w-4 h-4 rounded-full mr-3"
            :class="getThemeColor(theme.name)"
          ></div>
          {{ theme.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isOpen = ref(false)
const dropdown = ref(null)

const selectTheme = (themeName) => {
  themeStore.setTheme(themeName)
  isOpen.value = false
}

const getThemeColor = (themeName) => {
  const colorMap = {
    'red': 'bg-red-500',
    'orange': 'bg-orange-500',
    'yellow': 'bg-yellow-500',
    'green': 'bg-green-500',
    'blue': 'bg-blue-500',
    'indigo': 'bg-indigo-500',
    'purple': 'bg-purple-500'
  }
  return colorMap[themeName] || 'bg-gray-500'
}

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
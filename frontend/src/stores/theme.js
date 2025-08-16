import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const availableThemes = [
    { name: 'red', label: 'Red' },
    { name: 'orange', label: 'Orange' },
    { name: 'yellow', label: 'Yellow' },
    { name: 'green', label: 'Green' },
    { name: 'blue', label: 'Blue' },
    { name: 'indigo', label: 'Indigo' },
    { name: 'purple', label: 'Purple' }
  ]

  const currentTheme = ref(localStorage.getItem('theme') || 'red')

  const setTheme = (theme) => {
    if (availableThemes.some(t => t.name === theme)) {
      currentTheme.value = theme
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'red'
    setTheme(savedTheme)
  }

  const getCurrentTheme = computed(() => {
    return availableThemes.find(theme => theme.name === currentTheme.value)
  })

  return {
    availableThemes,
    currentTheme,
    setTheme,
    initializeTheme,
    getCurrentTheme
  }
})
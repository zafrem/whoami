<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">P</span>
            </div>
            <span class="text-xl font-semibold text-gray-900">{{ t('navigation.personalityHub') }}</span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/surveys"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            :class="{ 'text-primary-600': $route.path === '/surveys' }"
          >
            Surveys
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated && authStore.user?.isPro"
            to="/groups"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            :class="{ 'text-primary-600': $route.path === '/groups' }"
          >
            Groups
          </router-link>
          <template v-if="authStore.isAuthenticated && authStore.user?.isPro">
            <router-link
              to="/pro-features"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-medium transition-colors flex items-center"
              :class="{ 'text-primary-700': $route.path === '/pro-features' }"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
              Pro Features
            </router-link>
          </template>
        </nav>

        <div class="flex items-center space-x-4">
          <!-- Theme Switcher -->
          <ThemeSwitcher />
          
          <!-- Language Switcher -->
          <LanguageSwitcher />
          
          <template v-if="!authStore.isAuthenticated">
            <router-link
              to="/login"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              {{ t('common.login') }}
            </router-link>
            <router-link
              to="/register"
              class="btn-primary text-sm"
            >
              {{ t('common.register') }}
            </router-link>
          </template>

          <template v-else>
            <!-- Admin Button -->
            <router-link
              v-if="authStore.user?.role === 'admin'"
              to="/admin"
              class="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Admin
            </router-link>
            
            <div class="relative" ref="dropdown">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ authStore.initials }}</span>
                </div>
                <span class="text-gray-700 text-sm font-medium">{{ authStore.fullName || authStore.user?.username }}</span>
                <ChevronDownIcon class="w-4 h-4 text-gray-400" />
              </button>

              <div
                v-if="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  {{ t('common.profile') }}
                </router-link>
                <router-link
                  to="/results"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  {{ t('navigation.results') }}
                </router-link>
                <router-link
                  v-if="authStore.user?.isPro"
                  to="/groups"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  Groups
                </router-link>
                <router-link
                  v-if="authStore.user?.role === 'admin'"
                  to="/admin"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  Admin Dashboard
                </router-link>
                <hr class="my-1">
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {{ t('common.logout') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const showDropdown = ref(false)
const dropdown = ref(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
  closeDropdown()
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
<template>
  <div>
    <ColdStartLoader 
      v-if="authStore.coldStartLoading" 
      :show="true" 
      type="login" 
    />
    
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('auth.login.title') }}</h2>
        <p class="mt-2 text-gray-600">{{ t('auth.login.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="form-label" for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.email }"
              :placeholder="t('auth.emailPlaceholder')"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label class="form-label" for="password">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                :placeholder="t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
        </div>

        <!-- Privacy Warning -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">{{ t('auth.privacy.title') }}</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>{{ t('auth.privacy.locationWarning') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ authStore.error }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn-primary flex justify-center items-center"
          >
            <span v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.loading ? t('auth.signingIn') : t('auth.signIn') }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            {{ t('auth.login.noAccount') }}
            <router-link to="/register" class="text-primary-600 hover:text-primary-500 font-medium">
              {{ t('auth.login.signUpLink') }}
            </router-link>
          </p>
        </div>
      </form>
    </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import ColdStartLoader from '@/components/ColdStartLoader.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Reset cold start loading when component mounts
onMounted(() => {
  authStore.clearColdStart()
  console.log('Login component mounted, coldStartLoading:', authStore.coldStartLoading)
})

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = t('auth.validation.emailRequired')
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('auth.validation.emailInvalid')
    isValid = false
  }

  if (!form.password) {
    errors.password = t('auth.validation.passwordRequired')
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = t('auth.validation.passwordTooShort')
    isValid = false
  }

  return isValid
}

// Helper function to get GPS location
const getGPSLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported by this browser')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: position.timestamp
        })
      },
      (error) => {
        console.log('Geolocation error:', error.message)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

const handleSubmit = async () => {
  authStore.clearError()

  if (!validateForm()) {
    return
  }

  // Try to get GPS location (non-blocking)
  const geoLocation = await getGPSLocation()

  const loginData = {
    email: form.email,
    password: form.password
  }

  // Add GPS location if available
  if (geoLocation) {
    loginData.geoLocation = geoLocation
  }

  const result = await authStore.login(loginData)

  if (result.success) {
    window.showNotification('success', t('auth.login.welcomeBack'), t('auth.login.successMessage'))
    
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}
</script>
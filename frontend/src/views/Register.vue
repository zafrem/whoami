<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('auth.register.title') }}</h2>
        <p class="mt-2 text-gray-600">{{ t('auth.register.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label" for="firstName">{{ t('auth.firstName') }}</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                class="form-input"
                :placeholder="t('auth.firstNamePlaceholder')"
              />
            </div>
            <div>
              <label class="form-label" for="lastName">{{ t('auth.lastName') }}</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                class="form-input"
                :placeholder="t('auth.lastNamePlaceholder')"
              />
            </div>
          </div>

          <div>
            <label class="form-label" for="username">{{ t('auth.username') }}</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.username }"
              :placeholder="t('auth.usernamePlaceholder')"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

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
                autocomplete="new-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                :placeholder="t('auth.passwordCreatePlaceholder')"
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
            
            <!-- Password strength indicator -->
            <div v-if="form.password" class="mt-2">
              <div class="flex space-x-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full"
                  :class="getPasswordStrengthColor(i)"
                ></div>
              </div>
              <p class="text-xs mt-1" :class="getPasswordStrengthTextColor()">
                {{ passwordStrengthText }}
              </p>
            </div>
          </div>

          <div>
            <label class="form-label" for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.confirmPassword }"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <div>
            <label class="form-label" for="birthYear">{{ t('auth.birthYear') }}</label>
            <input
              id="birthYear"
              v-model="form.birthYear"
              type="number"
              :min="1900"
              :max="currentYear"
              class="form-input"
              :class="{ 'border-red-500': errors.birthYear }"
              :placeholder="t('auth.birthYearPlaceholder')"
            />
            <p v-if="errors.birthYear" class="mt-1 text-sm text-red-600">{{ errors.birthYear }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ t('auth.birthYearHelper') }}</p>
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
            {{ authStore.loading ? t('auth.creatingAccount') : t('auth.createAccount') }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            {{ t('auth.register.hasAccount') }}
            <router-link to="/login" class="text-primary-600 hover:text-primary-500 font-medium">
              {{ t('auth.register.signInLink') }}
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthYear: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthYear: ''
})

const currentYear = new Date().getFullYear()

const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0

  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return Math.min(strength, 4)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return t('auth.password.strength.veryWeak')
  if (strength === 1) return t('auth.password.strength.weak')
  if (strength === 2) return t('auth.password.strength.fair')
  if (strength === 3) return t('auth.password.strength.good')
  return t('auth.password.strength.strong')
})

const getPasswordStrengthColor = (index) => {
  const strength = passwordStrength.value
  if (index <= strength) {
    if (strength === 1) return 'bg-red-500'
    if (strength === 2) return 'bg-yellow-500'
    if (strength === 3) return 'bg-blue-500'
    if (strength >= 4) return 'bg-green-500'
  }
  return 'bg-gray-200'
}

const getPasswordStrengthTextColor = () => {
  const strength = passwordStrength.value
  if (strength === 1) return 'text-red-600'
  if (strength === 2) return 'text-yellow-600'
  if (strength === 3) return 'text-blue-600'
  if (strength >= 4) return 'text-green-600'
  return 'text-gray-500'
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (!form.username.trim()) {
    errors.username = t('auth.validation.usernameRequired')
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = t('auth.validation.usernameTooShort')
    isValid = false
  } else if (!/^[a-zA-Z0-9]+$/.test(form.username)) {
    errors.username = t('auth.validation.usernameInvalidChars')
    isValid = false
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = t('auth.validation.confirmPasswordRequired')
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('auth.validation.passwordMismatch')
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  authStore.clearError()

  if (!validateForm()) {
    return
  }

  const userData = {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password
  }

  if (form.firstName.trim()) {
    userData.firstName = form.firstName.trim()
  }

  if (form.lastName.trim()) {
    userData.lastName = form.lastName.trim()
  }

  if (form.birthYear) {
    userData.birthYear = parseInt(form.birthYear)
  }

  const result = await authStore.register(userData)

  if (result.success) {
    window.showNotification('success', t('auth.register.welcome'), t('auth.register.successMessage'))
    router.push('/')
  }
}
</script>
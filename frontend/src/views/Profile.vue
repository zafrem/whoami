<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('profile.title') }}</h1>
      <p class="text-gray-600">{{ t('profile.subtitle') }}</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Profile Information -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('profile.information.title') }}</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label" for="firstName">{{ t('auth.firstName') }}</label>
                <input
                  id="firstName"
                  v-model="profileForm.firstName"
                  type="text"
                  class="form-input"
                  :class="{ 'border-red-500': errors.firstName }"
                  :placeholder="t('auth.firstNamePlaceholder')"
                />
                <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
              </div>
              <div>
                <label class="form-label" for="lastName">{{ t('auth.lastName') }}</label>
                <input
                  id="lastName"
                  v-model="profileForm.lastName"
                  type="text"
                  class="form-input"
                  :class="{ 'border-red-500': errors.lastName }"
                  :placeholder="t('auth.lastNamePlaceholder')"
                />
                <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
              </div>
            </div>

            <div>
              <label class="form-label" for="username">{{ t('auth.username') }}</label>
              <input
                id="username"
                v-model="profileForm.username"
                type="text"
                class="form-input"
                :class="{ 'border-red-500': errors.username }"
                :placeholder="t('profile.usernamePlaceholder')"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>

            <div>
              <label class="form-label" for="email">{{ t('auth.email') }}</label>
              <input
                id="email"
                :value="authStore.user?.email"
                type="email"
                class="form-input bg-gray-50"
                disabled
              />
              <p class="mt-1 text-sm text-gray-500">{{ t('profile.emailCannotChange') }}</p>
            </div>

            <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-600">{{ authStore.error }}</p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="authStore.loading"
                class="btn-primary flex items-center"
              >
                <span v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {{ authStore.loading ? t('profile.updating') : t('profile.updateProfile') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Admin Dashboard -->
        <div v-if="authStore.user?.role === 'admin'" class="card">
          <div class="text-center">
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
        </div>

        <!-- Change Password -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('profile.password.title') }}</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="form-label" for="currentPassword">{{ t('profile.password.current') }}</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500': passwordErrors.currentPassword }"
                :placeholder="t('profile.password.currentPlaceholder')"
              />
              <p v-if="passwordErrors.currentPassword" class="mt-1 text-sm text-red-600">{{ passwordErrors.currentPassword }}</p>
            </div>

            <div>
              <label class="form-label" for="newPassword">{{ t('profile.password.new') }}</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500': passwordErrors.newPassword }"
                :placeholder="t('profile.password.newPlaceholder')"
              />
              <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600">{{ passwordErrors.newPassword }}</p>
            </div>

            <div>
              <label class="form-label" for="confirmPassword">{{ t('profile.password.confirm') }}</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'border-red-500': passwordErrors.confirmPassword }"
                :placeholder="t('profile.password.confirmPlaceholder')"
              />
              <p v-if="passwordErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ passwordErrors.confirmPassword }}</p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="passwordLoading"
                class="btn-primary flex items-center"
              >
                <span v-if="passwordLoading" class="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {{ passwordLoading ? t('profile.password.changing') : t('profile.password.changePassword') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Profile Summary -->
      <div class="space-y-6">
        <div class="card text-center">
          <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-medium">{{ authStore.initials }}</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ authStore.fullName || authStore.user?.username }}</h3>
          <p class="text-gray-500 text-sm">{{ authStore.user?.email }}</p>
          <div class="mt-4 text-xs text-gray-400">
            {{ t('profile.memberSince', { date: formatDate(authStore.user?.createdAt) }) }}
          </div>
        </div>

        <div v-if="dashboardData" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('profile.statistics.title') }}</h3>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">{{ t('profile.statistics.surveysCompleted') }}</span>
              <span class="font-semibold text-gray-900">{{ dashboardData.stats.totalSurveys }}</span>
            </div>
            
            <div v-if="Object.keys(dashboardData.stats.categoryCounts).length">
              <h4 class="text-sm font-medium text-gray-900 mb-2">{{ t('profile.statistics.byCategory') }}</h4>
              <div class="space-y-2">
                <div
                  v-for="(count, category) in dashboardData.stats.categoryCounts"
                  :key="category"
                  class="flex justify-between text-sm"
                >
                  <span class="text-gray-600 capitalize">{{ category }}</span>
                  <span class="text-gray-900">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="dashboardData?.recentResults?.length" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('profile.recentActivity') }}</h3>
          
          <div class="space-y-3">
            <div
              v-for="result in dashboardData.recentResults.slice(0, 3)"
              :key="result.id"
              class="text-sm"
            >
              <router-link
                :to="{ name: 'SurveyResult', params: { id: result.id } }"
                class="text-primary-600 hover:text-primary-500 font-medium block"
              >
                {{ result.survey.name }}
              </router-link>
              <p class="text-gray-500 text-xs">{{ formatDate(result.completedAt) }}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <router-link
              to="/results"
              class="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              {{ t('profile.viewAllResults') }} →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/api'

const { t } = useI18n()
const authStore = useAuthStore()

const dashboardData = ref(null)
const passwordLoading = ref(false)

const profileForm = reactive({
  firstName: '',
  lastName: '',
  username: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  username: ''
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loadDashboard = async () => {
  try {
    const response = await userAPI.getDashboard()
    dashboardData.value = response.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

const validateProfileForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (profileForm.firstName && profileForm.firstName.length > 50) {
    errors.firstName = t('profile.validation.firstNameTooLong')
    isValid = false
  }

  if (profileForm.lastName && profileForm.lastName.length > 50) {
    errors.lastName = t('profile.validation.lastNameTooLong')
    isValid = false
  }

  if (profileForm.username) {
    if (profileForm.username.length < 3) {
      errors.username = t('auth.validation.usernameTooShort')
      isValid = false
    } else if (!/^[a-zA-Z0-9]+$/.test(profileForm.username)) {
      errors.username = t('auth.validation.usernameInvalidChars')
      isValid = false
    }
  }

  return isValid
}

const validatePasswordForm = () => {
  let isValid = true
  Object.keys(passwordErrors).forEach(key => passwordErrors[key] = '')

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = t('profile.password.validation.currentRequired')
    isValid = false
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = t('profile.password.validation.newRequired')
    isValid = false
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = t('auth.validation.passwordTooShort')
    isValid = false
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('profile.password.validation.confirmRequired')
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('auth.validation.passwordMismatch')
    isValid = false
  }

  return isValid
}

const updateProfile = async () => {
  authStore.clearError()

  if (!validateProfileForm()) {
    return
  }

  const updates = {}
  if (profileForm.firstName !== authStore.user?.firstName) {
    updates.firstName = profileForm.firstName || null
  }
  if (profileForm.lastName !== authStore.user?.lastName) {
    updates.lastName = profileForm.lastName || null
  }
  if (profileForm.username !== authStore.user?.username) {
    updates.username = profileForm.username
  }

  if (Object.keys(updates).length === 0) {
    window.showNotification('info', t('profile.noChanges'), t('profile.noChangesMessage'))
    return
  }

  const result = await authStore.updateProfile(updates)

  if (result.success) {
    window.showNotification('success', t('profile.updated'), t('profile.updatedMessage'))
  }
}

const changePassword = async () => {
  passwordLoading.value = true
  authStore.clearError()

  if (!validatePasswordForm()) {
    passwordLoading.value = false
    return
  }

  const result = await authStore.changePassword({
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword
  })

  if (result.success) {
    window.showNotification('success', t('profile.password.changed'), t('profile.password.changedMessage'))
    
    // Clear form
    Object.keys(passwordForm).forEach(key => passwordForm[key] = '')
  }

  passwordLoading.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return t('common.unknown')
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  // Initialize form with current user data
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || ''
    profileForm.lastName = authStore.user.lastName || ''
    profileForm.username = authStore.user.username || ''
  }

  await loadDashboard()
})
</script>
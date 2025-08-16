<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-600">Manage surveys and users</p>
    </div>

    <!-- Quick Stats -->
    <div v-if="dashboardData" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Total Users</h3>
        <p class="text-3xl font-bold text-primary-600">{{ dashboardData.stats.totalUsers }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Total Surveys</h3>
        <p class="text-3xl font-bold text-primary-600">{{ dashboardData.stats.totalSurveys }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Active Users</h3>
        <p class="text-3xl font-bold text-primary-600">{{ dashboardData.stats.activeUsers }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'surveys'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'surveys' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Surveys
        </button>
        <button
          @click="activeTab = 'users'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Users
        </button>
      </nav>
    </div>

    <!-- Survey Management -->
    <div v-show="activeTab === 'surveys'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">Survey Management</h2>
        <button
          @click="showCreateSurvey = true"
          class="btn-primary"
        >
          Add Survey
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="survey in surveys" :key="survey.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ getLocalizedText(survey.name) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ survey.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ survey.language }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="survey.isExternal" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  External
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Internal
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="survey.isActive" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="copyIframeLink(survey)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    title="Copy embeddable iframe link"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                    </svg>
                    Copy Embed Link
                  </button>
                  <button
                    @click="copyDirectLink(survey)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    title="Copy direct survey link"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    Copy Direct Link
                  </button>
                  <button
                    @click="showEmbedCode(survey)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    title="Get iframe embed code"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    Embed Code
                  </button>
                  <button
                    v-if="survey.isExternal"
                    @click="viewExternalSurvey(survey)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    View External
                  </button>
                  <button
                    @click="deleteSurvey(survey)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Management -->
    <div v-show="activeTab === 'users'" class="space-y-6">
      <h2 class="text-xl font-semibold text-gray-900">User Management</h2>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.birthYear ? (new Date().getFullYear() - user.birthYear) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lastLoginLocation ? `${user.lastLoginLocation.country}, ${user.lastLoginLocation.city}` : 'Unknown' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Survey Modal -->
    <div v-if="showCreateSurvey" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Survey</h3>
          <form @submit.prevent="createSurvey" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name (English)</label>
              <input v-model="newSurvey.nameEn" type="text" required class="mt-1 form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Name (Korean)</label>
              <input v-model="newSurvey.nameKo" type="text" class="mt-1 form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description (English)</label>
              <textarea v-model="newSurvey.descEn" rows="2" class="mt-1 form-input"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description (Korean)</label>
              <textarea v-model="newSurvey.descKo" rows="2" class="mt-1 form-input"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Category</label>
                <select v-model="newSurvey.category" required class="mt-1 form-input">
                  <option value="personality">Personality</option>
                  <option value="political">Political</option>
                  <option value="financial">Financial</option>
                  <option value="career">Career</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Language</label>
                <select v-model="newSurvey.language" required class="mt-1 form-input">
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                </select>
              </div>
            </div>
            <div>
              <label class="flex items-center">
                <input v-model="newSurvey.isExternal" type="checkbox" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">External Survey</span>
              </label>
            </div>
            <div v-if="newSurvey.isExternal">
              <label class="block text-sm font-medium text-gray-700">External URL</label>
              <input v-model="newSurvey.externalUrl" type="url" required class="mt-1 form-input" />
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700">Questions JSON</label>
              <textarea v-model="newSurvey.questionsJson" rows="6" required class="mt-1 form-input" placeholder='{"questions": [...]}' style="font-family: monospace;"></textarea>
              <label class="block text-sm font-medium text-gray-700 mt-4">Analysis JSON</label>
              <textarea v-model="newSurvey.analysisJson" rows="4" required class="mt-1 form-input" placeholder='{"analysis": {...}}' style="font-family: monospace;"></textarea>
            </div>
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary">Create Survey</button>
              <button type="button" @click="showCreateSurvey = false" class="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- External Survey Link Modal -->
    <div v-if="showExternalLink" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">External Survey Link</h3>
          <div class="mb-4 p-3 bg-gray-50 rounded border">
            <a :href="selectedSurvey?.externalUrl" target="_blank" class="text-primary-600 hover:text-primary-800 break-all">
              {{ selectedSurvey?.externalUrl }}
            </a>
          </div>
          <p class="text-sm text-gray-500 mb-4">This link is only visible to administrators.</p>
          <button @click="showExternalLink = false" class="btn-primary">Close</button>
        </div>
      </div>
    </div>

    <!-- Embed Code Modal -->
    <div v-if="showEmbedModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Embed Survey: {{ getLocalizedText(selectedSurvey?.name) }}</h3>
          
          <div class="space-y-4">
            <!-- Embed URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Embeddable URL</label>
              <div class="flex">
                <input
                  :value="embedUrl"
                  readonly
                  class="flex-1 form-input bg-gray-50"
                />
                <button
                  @click="copyText(embedUrl)"
                  class="ml-2 btn-secondary px-3"
                >
                  Copy
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Use this URL directly in an iframe</p>
            </div>

            <!-- Iframe Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Iframe Embed Code</label>
              <div class="relative">
                <textarea
                  :value="iframeCode"
                  readonly
                  rows="4"
                  class="w-full form-input bg-gray-50 font-mono text-sm"
                ></textarea>
                <button
                  @click="copyText(iframeCode)"
                  class="absolute top-2 right-2 btn-secondary px-3 py-1 text-xs"
                >
                  Copy
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Paste this HTML code into any webpage</p>
            </div>

            <!-- Customization Options -->
            <div class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Customization Options</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700">Width</label>
                  <input
                    v-model="embedOptions.width"
                    type="text"
                    class="form-input text-sm"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-700">Height</label>
                  <input
                    v-model="embedOptions.height"
                    type="text"
                    class="form-input text-sm"
                    placeholder="600px"
                  />
                </div>
              </div>
              <div class="mt-3">
                <label class="flex items-center text-sm">
                  <input
                    v-model="embedOptions.allowFullscreen"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                  />
                  <span class="ml-2">Allow fullscreen</span>
                </label>
              </div>
            </div>

            <!-- Preview -->
            <div class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Preview</h4>
              <div class="border border-gray-300 rounded-lg bg-gray-50 p-4">
                <iframe
                  :src="embedUrl"
                  :width="embedOptions.width"
                  :height="embedOptions.height === 'auto' ? '400px' : embedOptions.height"
                  :allowfullscreen="embedOptions.allowFullscreen"
                  frameborder="0"
                  class="border border-gray-200 rounded"
                ></iframe>
              </div>
            </div>
          </div>

          <div class="flex space-x-3 pt-6 border-t">
            <button @click="copyText(iframeCode)" class="btn-primary">Copy Embed Code</button>
            <button @click="showEmbedModal = false" class="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const { locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('surveys')
const dashboardData = ref(null)
const surveys = ref([])
const users = ref([])
const loading = ref(false)
const showCreateSurvey = ref(false)
const showExternalLink = ref(false)
const showEmbedModal = ref(false)
const selectedSurvey = ref(null)

const newSurvey = ref({
  nameEn: '',
  nameKo: '',
  descEn: '',
  descKo: '',
  category: 'personality',
  language: 'en',
  isExternal: false,
  externalUrl: '',
  questionsJson: '',
  analysisJson: ''
})

const embedOptions = ref({
  width: '100%',
  height: '600px',
  allowFullscreen: true
})

const embedUrl = computed(() => {
  if (!selectedSurvey.value) return ''
  return `${window.location.origin}/embed/${selectedSurvey.value.id}`
})

const iframeCode = computed(() => {
  if (!selectedSurvey.value) return ''
  const fullscreenAttr = embedOptions.value.allowFullscreen ? ' allowfullscreen' : ''
  return `<iframe src="${embedUrl.value}" width="${embedOptions.value.width}" height="${embedOptions.value.height}" frameborder="0"${fullscreenAttr}></iframe>`
})

// Check admin access
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }

  await loadDashboard()
  await loadSurveys()
  await loadUsers()
})

const getLocalizedText = (textObj) => {
  if (typeof textObj === 'string') return textObj
  if (typeof textObj === 'object' && textObj !== null) {
    return textObj[locale.value] || textObj['en'] || Object.values(textObj)[0] || ''
  }
  return String(textObj || '')
}

const loadDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard')
    dashboardData.value = response.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

const loadSurveys = async () => {
  try {
    const response = await api.get('/admin/surveys')
    surveys.value = response.data.surveys
  } catch (error) {
    console.error('Failed to load surveys:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await api.get('/admin/users')
    users.value = response.data.users
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const createSurvey = async () => {
  try {
    const surveyData = {
      name: {
        en: newSurvey.value.nameEn,
        ko: newSurvey.value.nameKo || newSurvey.value.nameEn
      },
      description: {
        en: newSurvey.value.descEn,
        ko: newSurvey.value.descKo || newSurvey.value.descEn
      },
      category: newSurvey.value.category,
      language: newSurvey.value.language,
      isExternal: newSurvey.value.isExternal,
      externalUrl: newSurvey.value.isExternal ? newSurvey.value.externalUrl : null,
      questionsJson: newSurvey.value.isExternal ? {} : JSON.parse(newSurvey.value.questionsJson),
      analysisJson: newSurvey.value.isExternal ? {} : JSON.parse(newSurvey.value.analysisJson)
    }

    await api.post('/admin/surveys', surveyData)
    showCreateSurvey.value = false
    resetNewSurvey()
    await loadSurveys()
    window.showNotification('success', 'Success', 'Survey created successfully')
  } catch (error) {
    console.error('Failed to create survey:', error)
    window.showNotification('error', 'Error', 'Failed to create survey')
  }
}

const deleteSurvey = async (survey) => {
  if (confirm(`Are you sure you want to delete "${getLocalizedText(survey.name)}"?`)) {
    try {
      await api.delete(`/admin/surveys/${survey.id}`)
      await loadSurveys()
      window.showNotification('success', 'Success', 'Survey deleted successfully')
    } catch (error) {
      console.error('Failed to delete survey:', error)
      window.showNotification('error', 'Error', 'Failed to delete survey')
    }
  }
}

const copyIframeLink = async (survey) => {
  const embedUrl = `${window.location.origin}/embed/${survey.id}`
  await copyText(embedUrl)
  window.showNotification('success', 'Success', 'Embed link copied to clipboard!')
}

const copyDirectLink = async (survey) => {
  const directUrl = `${window.location.origin}/survey/${survey.id}`
  await copyText(directUrl)
  window.showNotification('success', 'Success', 'Direct survey link copied to clipboard!')
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    textArea.setSelectionRange(0, 99999) // For mobile devices
    
    try {
      document.execCommand('copy')
    } catch (fallbackError) {
      window.showNotification('error', 'Error', 'Failed to copy. Please copy manually: ' + text)
    }
    
    document.body.removeChild(textArea)
  }
}

const showEmbedCode = (survey) => {
  selectedSurvey.value = survey
  showEmbedModal.value = true
}

const viewExternalSurvey = (survey) => {
  selectedSurvey.value = survey
  showExternalLink.value = true
}

const resetNewSurvey = () => {
  newSurvey.value = {
    nameEn: '',
    nameKo: '',
    descEn: '',
    descKo: '',
    category: 'personality',
    language: 'en',
    isExternal: false,
    externalUrl: '',
    questionsJson: '',
    analysisJson: ''
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
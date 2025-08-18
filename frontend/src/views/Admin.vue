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
        <button
          @click="activeTab = 'llm-config'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'llm-config' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          LLM Config
        </button>
        <button
          @click="activeTab = 'llm-logs'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'llm-logs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          LLM Logs
        </button>
        <button
          @click="activeTab = 'groups'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'groups' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Groups
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
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">User Management</h2>
          <p class="text-sm text-gray-600 mt-1">Manage user accounts, Pro subscriptions, and account status</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg">
          <h3 class="text-sm font-medium text-blue-900 mb-2">🔐 Admin-Only Controls</h3>
          <div class="text-xs text-blue-800 space-y-2">
            <div class="bg-white rounded p-2 border border-blue-100">
              <strong>Role Management (Admin ↔ User):</strong>
              <br>• Promote users to Admin (grants management access)
              <br>• Demote admins to User (removes management access)
              <br>• Independent from Pro/Free status
            </div>
            <div class="bg-white rounded p-2 border border-blue-100">
              <strong>Type Management (Pro ↔ Free):</strong>
              <br>• Grant/Remove Pro access (Groups feature)
              <br>• Independent from Admin/User role
              <br>• Works for both admins and users
            </div>
            <div class="bg-white rounded p-2 border border-blue-100">
              <strong>Account Control:</strong>
              <br>• Activate/Deactivate any account
              <br>• Controls login access to platform
            </div>
            <div class="bg-white rounded p-2 border border-blue-100">
              <strong>Access Matrix:</strong>
              <br>• <span class="text-purple-700">Admin + Pro:</span> Full access + Groups + Management
              <br>• <span class="text-purple-700">Admin + Free:</span> Management + Basic features
              <br>• <span class="text-yellow-700">User + Pro:</span> Groups + All features
              <br>• <span class="text-gray-700">User + Free:</span> Basic features only
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Controls</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Controls</th>
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
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.isPro ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ user.isPro ? 'Pro' : 'Free' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.birthYear ? (new Date().getFullYear() - user.birthYear) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="user.lastLogin">
                  <div>{{ formatDate(user.lastLogin) }}</div>
                  <div v-if="user.lastLoginLocation" class="text-xs text-gray-400 mt-1 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{{ formatLoginLocation(user.lastLoginLocation) }}</span>
                  </div>
                </div>
                <div v-else>Never</div>
              </td>
              
              <!-- Role Controls Column -->
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col space-y-2">
                  <button
                    @click="toggleUserRole(user)"
                    :class="user.role === 'admin' ? 'bg-purple-600 hover:bg-purple-700 border-purple-600' : 'bg-blue-600 hover:bg-blue-700 border-blue-600'"
                    class="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white rounded-md transition-all duration-200 border-2 hover:shadow-md"
                    :title="user.role === 'admin' ? 'Demote to regular user - removes admin privileges' : 'Promote to admin - grants admin privileges'"
                  >
                    <svg v-if="user.role === 'admin'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                    {{ user.role === 'admin' ? 'Demote to User' : 'Promote to Admin' }}
                  </button>
                  
                  <button
                    @click="toggleUserActive(user)"
                    :class="user.isActive ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'bg-green-600 hover:bg-green-700 border-green-600'"
                    class="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white rounded-md transition-all duration-200 border-2 hover:shadow-md"
                    :title="user.isActive ? 'Deactivate account - user cannot log in' : 'Activate account - user can log in'"
                  >
                    <svg v-if="user.isActive" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
              
              <!-- Type Controls Column -->
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col space-y-2">
                  <button
                    @click="toggleUserPro(user)"
                    :class="user.isPro ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-600' : 'bg-green-600 hover:bg-green-700 border-green-600'"
                    class="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white rounded-md transition-all duration-200 border-2 hover:shadow-md"
                    :title="user.isPro ? 'Remove Pro access - user will lose Groups feature' : 'Grant Pro access - user will gain Groups feature'"
                  >
                    <svg v-if="user.isPro" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    {{ user.isPro ? 'Remove Pro' : 'Make Pro' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- LLM Configuration Tab -->
    <div v-show="activeTab === 'llm-config'" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">LLM Configuration</h2>
          <p class="text-sm text-gray-600 mt-1">Manage AI providers for group matching and personality analysis</p>
        </div>
        <button
          @click="showCreateLLMConfig = true"
          class="btn-primary"
        >
          Add LLM Provider
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="config in llmConfigs" :key="config.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div :class="getProviderColor(config.provider)" class="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {{ config.provider.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ config.provider }}</div>
                    <div v-if="config.apiEndpoint" class="text-sm text-gray-500 truncate max-w-xs">{{ config.apiEndpoint }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ config.model }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ config.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="config.isDefault" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Default
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(config.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="testLLMConfig(config)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Test
                  </button>
                  <button
                    @click="toggleLLMDefault(config)"
                    :class="config.isDefault ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex items-center px-2 py-1 text-xs rounded hover:bg-opacity-75"
                  >
                    {{ config.isDefault ? 'Unset Default' : 'Set Default' }}
                  </button>
                  <button
                    @click="toggleLLMActive(config)"
                    :class="config.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                    class="inline-flex items-center px-2 py-1 text-xs rounded hover:bg-opacity-75"
                  >
                    {{ config.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    @click="deleteLLMConfig(config)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="llmConfigs.length === 0" class="text-center py-12">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No LLM providers configured</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by adding your first AI provider for group matching.</p>
            <div class="mt-6">
              <button @click="showCreateLLMConfig = true" class="btn-primary">Add LLM Provider</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LLM Logs Tab -->
    <div v-show="activeTab === 'llm-logs'" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">LLM Activity Logs</h2>
          <p class="text-sm text-gray-600 mt-1">Monitor AI interactions and matching analysis results</p>
        </div>
        <div class="flex space-x-3">
          <select v-model="logFilters.provider" @change="loadLLMLogs" class="form-input text-sm">
            <option value="">All Providers</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="ollama">Ollama</option>
          </select>
          <select v-model="logFilters.operation" @change="loadLLMLogs" class="form-input text-sm">
            <option value="">All Operations</option>
            <option value="matching_analysis">Matching Analysis</option>
            <option value="compatibility_check">Compatibility Check</option>
            <option value="group_recommendation">Group Recommendation</option>
          </select>
          <button @click="loadLLMLogs" class="btn-secondary text-sm">
            Refresh
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="log in llmLogs" :key="log.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div :class="getProviderColor(log.provider)" class="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                      {{ log.provider.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ log.provider }}</div>
                      <div class="text-sm text-gray-500">{{ log.model }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ log.operation.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.userHashes.length }} users
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ log.success ? 'Success' : 'Failed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(log.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.processingTime ? (log.processingTime / 1000).toFixed(2) + 's' : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewLogDetails(log)"
                    class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="llmLogs.length === 0" class="text-center py-12">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No LLM activity logs</h3>
            <p class="mt-1 text-sm text-gray-500">AI interactions will appear here once users start using group matching features.</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="llmLogsPagination.totalPages > 1" class="flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Showing {{ (llmLogsPagination.page - 1) * llmLogsPagination.limit + 1 }} to {{ Math.min(llmLogsPagination.page * llmLogsPagination.limit, llmLogsPagination.total) }} of {{ llmLogsPagination.total }} results
        </div>
        <div class="flex space-x-2">
          <button
            @click="changePage(llmLogsPagination.page - 1)"
            :disabled="llmLogsPagination.page <= 1"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md">
            {{ llmLogsPagination.page }} of {{ llmLogsPagination.totalPages }}
          </span>
          <button
            @click="changePage(llmLogsPagination.page + 1)"
            :disabled="llmLogsPagination.page >= llmLogsPagination.totalPages"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Groups Management Tab -->
    <div v-show="activeTab === 'groups'" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Groups Management</h2>
          <p class="text-sm text-gray-600 mt-1">View and manage all matching groups in the system</p>
        </div>
        <button @click="loadGroups" class="btn-secondary">
          Refresh
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="group in groups" :key="group.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ group.name }}</div>
                  <div v-if="group.description" class="text-sm text-gray-500 max-w-xs truncate">{{ group.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="group.matchingType === '1:1' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'">
                    {{ group.matchingType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <span>{{ group.currentParticipants }}/{{ group.maxParticipants }}</span>
                    <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div class="bg-primary-600 h-2 rounded-full" 
                        :style="{ width: `${(group.currentParticipants / group.maxParticipants) * 100}%` }"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ group.creatorUsername || 'Unknown' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ group.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(group.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewGroupDetails(group)"
                      class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
                    <button
                      @click="confirmDeleteGroup(group)"
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
        
        <div v-if="groups.length === 0" class="text-center py-12">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
            <p class="mt-1 text-sm text-gray-500">Groups will appear here once users start creating them.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Group Details Modal -->
    <div v-if="showGroupDetails && selectedGroup" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Group Details</h3>
            <button @click="showGroupDetails = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Name:</span>
                  <div class="font-medium">{{ selectedGroup.name }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Type:</span>
                  <div class="font-medium">{{ selectedGroup.matchingType }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Participants:</span>
                  <div class="font-medium">{{ selectedGroup.currentParticipants }}/{{ selectedGroup.maxParticipants }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Status:</span>
                  <div class="font-medium">{{ selectedGroup.isActive ? 'Active' : 'Inactive' }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Created:</span>
                  <div class="font-medium">{{ formatDate(selectedGroup.createdAt) }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Creator:</span>
                  <div class="font-medium">{{ selectedGroup.creatorUsername || 'Unknown' }}</div>
                </div>
              </div>
            </div>

            <div v-if="selectedGroup.description">
              <h4 class="font-medium text-gray-900 mb-2">Description</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">{{ selectedGroup.description }}</p>
              </div>
            </div>

            <div v-if="selectedGroup.memberHashes && selectedGroup.memberHashes.length > 0">
              <h4 class="font-medium text-gray-900 mb-2">Members ({{ selectedGroup.memberHashes.length }})</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="(hash, index) in selectedGroup.memberHashes" :key="index" 
                    class="bg-white rounded px-3 py-2 text-sm font-mono border">
                    {{ hash.substring(0, 8) }}...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button @click="confirmDeleteGroup(selectedGroup)" class="btn-danger">
              Delete Group
            </button>
            <button @click="showGroupDetails = false" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Group Confirmation Modal -->
    <div v-if="showDeleteConfirmation && groupToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4 mb-2">Delete Group</h3>
          <p class="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the group <strong>"{{ groupToDelete.name }}"</strong>?
          </p>
          <div class="text-sm text-gray-600 mb-4 space-y-1">
            <div>• {{ groupToDelete.currentParticipants }} member(s) will be removed</div>
            <div>• All group data will be permanently deleted</div>
            <div>• This action cannot be undone</div>
          </div>
          <div class="flex justify-center space-x-3">
            <button @click="deleteGroup(groupToDelete)" class="btn-danger" :disabled="deletingGroup">
              {{ deletingGroup ? 'Deleting...' : 'Delete Group' }}
            </button>
            <button @click="cancelDeleteGroup" class="btn-secondary" :disabled="deletingGroup">
              Cancel
            </button>
          </div>
        </div>
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

    <!-- Create LLM Config Modal -->
    <div v-if="showCreateLLMConfig" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add LLM Provider Configuration</h3>
          <form @submit.prevent="createLLMConfig" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Provider</label>
                <select v-model="newLLMConfig.provider" required class="mt-1 form-input">
                  <option value="">Select Provider</option>
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gemini">Gemini (Google)</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Model</label>
                <input v-model="newLLMConfig.model" type="text" required class="mt-1 form-input" placeholder="e.g., claude-3-sonnet-20240229" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">API Key</label>
              <input v-model="newLLMConfig.apiKey" type="password" class="mt-1 form-input" placeholder="Enter API key (optional for Ollama)" />
              <p class="text-xs text-gray-500 mt-1">API keys are encrypted before storage</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">API Endpoint (Optional)</label>
              <input v-model="newLLMConfig.apiEndpoint" type="url" class="mt-1 form-input" placeholder="Custom endpoint URL (for Ollama or custom deployments)" />
            </div>
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input v-model="newLLMConfig.isActive" type="checkbox" class="rounded border-gray-300 text-primary-600" />
                <span class="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label class="flex items-center">
                <input v-model="newLLMConfig.isDefault" type="checkbox" class="rounded border-gray-300 text-primary-600" />
                <span class="ml-2 text-sm text-gray-700">Set as Default</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Configuration JSON (Optional)</label>
              <textarea v-model="newLLMConfig.configJson" rows="4" class="mt-1 form-input" placeholder='{"temperature": 0.7, "max_tokens": 4096}' style="font-family: monospace;"></textarea>
              <p class="text-xs text-gray-500 mt-1">Additional provider-specific configuration</p>
            </div>
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary">Add Provider</button>
              <button type="button" @click="showCreateLLMConfig = false" class="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- LLM Log Details Modal -->
    <div v-if="showLogDetails && selectedLog" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">LLM Interaction Details</h3>
            <button @click="showLogDetails = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Basic Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Provider:</span>
                  <div class="font-medium">{{ selectedLog.provider }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Model:</span>
                  <div class="font-medium">{{ selectedLog.model }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Operation:</span>
                  <div class="font-medium">{{ selectedLog.operation.replace('_', ' ') }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Status:</span>
                  <div :class="selectedLog.success ? 'text-green-600' : 'text-red-600'" class="font-medium">
                    {{ selectedLog.success ? 'Success' : 'Failed' }}
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">Users:</span>
                  <div class="font-medium">{{ selectedLog.userHashes.length }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Processing Time:</span>
                  <div class="font-medium">{{ selectedLog.processingTime ? (selectedLog.processingTime / 1000).toFixed(2) + 's' : 'N/A' }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Created:</span>
                  <div class="font-medium">{{ formatDate(selectedLog.createdAt) }}</div>
                </div>
                <div v-if="selectedLog.groupId">
                  <span class="text-gray-500">Group ID:</span>
                  <div class="font-medium font-mono text-xs">{{ selectedLog.groupId }}</div>
                </div>
              </div>
            </div>

            <!-- User Hashes -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Analyzed Users</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div v-for="(hash, index) in selectedLog.userHashes" :key="index" class="bg-white rounded px-3 py-2 text-sm font-mono">
                    {{ hash.substring(0, 12) }}...
                  </div>
                </div>
              </div>
            </div>

            <!-- Prompt -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Prompt Sent</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-64 overflow-y-auto">{{ selectedLog.prompt }}</pre>
              </div>
            </div>

            <!-- Response -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">AI Response</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-64 overflow-y-auto">{{ selectedLog.response }}</pre>
              </div>
            </div>

            <!-- Token Usage -->
            <div v-if="selectedLog.tokenUsage">
              <h4 class="font-medium text-gray-900 mb-3">Token Usage</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div v-if="selectedLog.tokenUsage.input_tokens">
                    <span class="text-gray-500">Input Tokens:</span>
                    <div class="font-medium">{{ selectedLog.tokenUsage.input_tokens }}</div>
                  </div>
                  <div v-if="selectedLog.tokenUsage.output_tokens">
                    <span class="text-gray-500">Output Tokens:</span>
                    <div class="font-medium">{{ selectedLog.tokenUsage.output_tokens }}</div>
                  </div>
                  <div v-if="selectedLog.tokenUsage.total_tokens">
                    <span class="text-gray-500">Total Tokens:</span>
                    <div class="font-medium">{{ selectedLog.tokenUsage.total_tokens }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="!selectedLog.success && selectedLog.error">
              <h4 class="font-medium text-red-900 mb-3">Error Details</h4>
              <div class="bg-red-50 rounded-lg p-4">
                <pre class="whitespace-pre-wrap text-sm text-red-800 font-mono">{{ selectedLog.error }}</pre>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button @click="showLogDetails = false" class="btn-secondary">Close</button>
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
const groups = ref([])
const loading = ref(false)
const showCreateSurvey = ref(false)
const showExternalLink = ref(false)
const showEmbedModal = ref(false)
const selectedSurvey = ref(null)

// Groups management state
const showGroupDetails = ref(false)
const selectedGroup = ref(null)
const showDeleteConfirmation = ref(false)
const groupToDelete = ref(null)
const deletingGroup = ref(false)

// LLM Management
const showCreateLLMConfig = ref(false)
const showLogDetails = ref(false)
const selectedLog = ref(null)
const llmConfigs = ref([])
const llmLogs = ref([])
const llmLogsPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})
const logFilters = ref({
  provider: '',
  operation: ''
})

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

const newLLMConfig = ref({
  provider: '',
  model: '',
  apiKey: '',
  apiEndpoint: '',
  isActive: true,
  isDefault: false,
  configJson: ''
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
  await loadGroups()
  await loadLLMConfigs()
  await loadLLMLogs()
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

const toggleUserPro = async (user) => {
  try {
    const newProStatus = !user.isPro
    const action = newProStatus ? 'upgrade to Pro' : 'downgrade to Free'
    
    if (!confirm(`Are you sure you want to ${action} user "${user.username}"?\n\n${newProStatus ? 'Pro users can access Groups and matching features.' : 'Free users will lose access to Groups and matching features.'}`)) {
      return
    }
    
    await api.put(`/admin/users/${user.id}`, {
      isPro: newProStatus
    })
    
    // Update local state
    user.isPro = newProStatus
    
    alert(`✅ Success!\nUser "${user.username}" is now ${newProStatus ? 'Pro' : 'Free'}\n\n${newProStatus ? '• Can access Groups\n• Can use matching features\n• Full platform access' : '• Cannot access Groups\n• Cannot use matching features\n• Basic platform access only'}`)
  } catch (error) {
    console.error('Failed to update user Pro status:', error)
    alert(`❌ Error\nFailed to update user Pro status.\n\nPlease try again or check the console for details.`)
  }
}

const toggleUserRole = async (user) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'promote to Admin' : 'demote to User'
    
    if (!confirm(`Are you sure you want to ${action} user "${user.username}"?\n\n${newRole === 'admin' ? 'User will gain:\n• Admin dashboard access\n• User management privileges\n• Survey management privileges' : 'User will lose:\n• Admin dashboard access\n• User management privileges\n• Survey management privileges'}\n\nThis is independent of Pro/Free status.`)) {
      return
    }
    
    await api.put(`/admin/users/${user.id}`, {
      role: newRole
    })
    
    // Update local state
    user.role = newRole
    
    alert(`✅ Success!\nUser "${user.username}" is now ${newRole === 'admin' ? 'an Admin' : 'a regular User'}\n\n${newRole === 'admin' ? '• Can access admin dashboard\n• Can manage users and surveys\n• Has administrative privileges' : '• Cannot access admin dashboard\n• No management privileges\n• Regular user access only'}\n\nPro/Free status remains unchanged.`)
  } catch (error) {
    console.error('Failed to update user role:', error)
    alert(`❌ Error\nFailed to update user role.\n\nPlease try again or check the console for details.`)
  }
}

const toggleUserActive = async (user) => {
  try {
    const newActiveStatus = !user.isActive
    const action = newActiveStatus ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} user "${user.username}"?\n\n${newActiveStatus ? 'User will be able to log in and use the platform.' : 'User will be unable to log in and access the platform.'}`)) {
      return
    }
    
    await api.put(`/admin/users/${user.id}`, {
      isActive: newActiveStatus
    })
    
    // Update local state
    user.isActive = newActiveStatus
    
    alert(`✅ Success!\nUser "${user.username}" is now ${newActiveStatus ? 'active' : 'deactivated'}\n\n${newActiveStatus ? '• Can log in\n• Can use platform features\n• Account is active' : '• Cannot log in\n• Cannot access platform\n• Account is suspended'}`)
  } catch (error) {
    console.error('Failed to update user active status:', error)
    alert(`❌ Error\nFailed to update user account status.\n\nPlease try again or check the console for details.`)
  }
}

// Groups Management Functions
const loadGroups = async () => {
  try {
    const response = await api.get('/admin/groups')
    groups.value = response.data.groups || []
  } catch (error) {
    console.error('Failed to load groups:', error)
    // Fallback to regular groups endpoint for now
    try {
      const response = await api.get('/groups')
      groups.value = response.data.groups || []
    } catch (fallbackError) {
      console.error('Failed to load groups from fallback endpoint:', fallbackError)
      window.showNotification('error', 'Error', 'Failed to load groups')
    }
  }
}

const viewGroupDetails = async (group) => {
  try {
    const response = await api.get(`/groups/${group.id}`)
    selectedGroup.value = response.data.group
    showGroupDetails.value = true
  } catch (error) {
    console.error('Failed to load group details:', error)
    window.showNotification('error', 'Error', 'Failed to load group details')
  }
}

const confirmDeleteGroup = (group) => {
  groupToDelete.value = group
  showDeleteConfirmation.value = true
  showGroupDetails.value = false
}

const cancelDeleteGroup = () => {
  groupToDelete.value = null
  showDeleteConfirmation.value = false
}

const deleteGroup = async (group) => {
  try {
    deletingGroup.value = true
    await api.delete(`/groups/${group.id}`)
    
    // Remove from local state
    const index = groups.value.findIndex(g => g.id === group.id)
    if (index !== -1) {
      groups.value.splice(index, 1)
    }
    
    // Close modals
    showDeleteConfirmation.value = false
    showGroupDetails.value = false
    groupToDelete.value = null
    
    window.showNotification('success', 'Success', `Group "${group.name}" deleted successfully`)
  } catch (error) {
    console.error('Failed to delete group:', error)
    const message = error.response?.data?.error || 'Failed to delete group'
    window.showNotification('error', 'Error', message)
  } finally {
    deletingGroup.value = false
  }
}

// LLM Management Functions
const loadLLMConfigs = async () => {
  try {
    const response = await api.get('/admin/llm-configs')
    llmConfigs.value = response.data.configs
  } catch (error) {
    console.error('Failed to load LLM configs:', error)
  }
}

const loadLLMLogs = async (page = 1) => {
  try {
    const params = {
      page,
      limit: llmLogsPagination.value.limit,
      ...logFilters.value
    }
    const response = await api.get('/admin/llm-logs', { params })
    llmLogs.value = response.data.logs
    llmLogsPagination.value = {
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages
    }
  } catch (error) {
    console.error('Failed to load LLM logs:', error)
  }
}

const createLLMConfig = async () => {
  try {
    const configData = {
      provider: newLLMConfig.value.provider,
      model: newLLMConfig.value.model,
      apiKey: newLLMConfig.value.apiKey || null,
      apiEndpoint: newLLMConfig.value.apiEndpoint || null,
      isActive: newLLMConfig.value.isActive,
      isDefault: newLLMConfig.value.isDefault,
      config: newLLMConfig.value.configJson ? JSON.parse(newLLMConfig.value.configJson) : null
    }

    await api.post('/admin/llm-configs', configData)
    showCreateLLMConfig.value = false
    resetNewLLMConfig()
    await loadLLMConfigs()
    window.showNotification('success', 'Success', 'LLM provider added successfully')
  } catch (error) {
    console.error('Failed to create LLM config:', error)
    const message = error.response?.data?.error || 'Failed to add LLM provider'
    window.showNotification('error', 'Error', message)
  }
}

const testLLMConfig = async (config) => {
  try {
    loading.value = true
    const response = await api.post(`/admin/llm-configs/${config.id}/test`)
    window.showNotification('success', 'Test Successful', response.data.message)
  } catch (error) {
    console.error('Failed to test LLM config:', error)
    const message = error.response?.data?.error || 'Failed to test LLM configuration'
    window.showNotification('error', 'Test Failed', message)
  } finally {
    loading.value = false
  }
}

const toggleLLMDefault = async (config) => {
  try {
    await api.put(`/admin/llm-configs/${config.id}`, {
      isDefault: !config.isDefault
    })
    await loadLLMConfigs()
    window.showNotification('success', 'Success', `${config.provider} ${config.isDefault ? 'unset' : 'set'} as default`)
  } catch (error) {
    console.error('Failed to toggle LLM default:', error)
    window.showNotification('error', 'Error', 'Failed to update default status')
  }
}

const toggleLLMActive = async (config) => {
  try {
    await api.put(`/admin/llm-configs/${config.id}`, {
      isActive: !config.isActive
    })
    await loadLLMConfigs()
    window.showNotification('success', 'Success', `${config.provider} ${config.isActive ? 'deactivated' : 'activated'}`)
  } catch (error) {
    console.error('Failed to toggle LLM active status:', error)
    window.showNotification('error', 'Error', 'Failed to update active status')
  }
}

const deleteLLMConfig = async (config) => {
  if (confirm(`Are you sure you want to delete the ${config.provider} configuration?\n\nThis action cannot be undone.`)) {
    try {
      await api.delete(`/admin/llm-configs/${config.id}`)
      await loadLLMConfigs()
      window.showNotification('success', 'Success', 'LLM provider deleted successfully')
    } catch (error) {
      console.error('Failed to delete LLM config:', error)
      window.showNotification('error', 'Error', 'Failed to delete LLM provider')
    }
  }
}

const viewLogDetails = (log) => {
  selectedLog.value = log
  showLogDetails.value = true
}

const changePage = (page) => {
  if (page >= 1 && page <= llmLogsPagination.value.totalPages) {
    loadLLMLogs(page)
  }
}

const resetNewLLMConfig = () => {
  newLLMConfig.value = {
    provider: '',
    model: '',
    apiKey: '',
    apiEndpoint: '',
    isActive: true,
    isDefault: false,
    configJson: ''
  }
}

const getProviderColor = (provider) => {
  const colors = {
    claude: 'bg-orange-500',
    gemini: 'bg-blue-500', 
    openai: 'bg-green-500',
    ollama: 'bg-purple-500'
  }
  return colors[provider] || 'bg-gray-500'
}

const formatLoginLocation = (location) => {
  if (!location) return 'Unknown location'
  
  const parts = []
  if (location.city && location.city !== 'Unknown') {
    parts.push(location.city)
  }
  if (location.country && location.country !== 'Unknown') {
    parts.push(location.country)
  }
  
  if (parts.length === 0) {
    return location.ip ? `IP: ${location.ip}` : 'Unknown location'
  }
  
  return parts.join(', ')
}
</script>
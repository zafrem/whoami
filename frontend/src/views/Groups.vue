<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Matching Groups</h1>
      <div class="flex gap-4">
        <button
          @click="showMatchingInfo = true"
          class="btn-secondary"
        >
          Matching Types Info
        </button>
        <button
          v-if="authStore.isAuthenticated"
          @click="showCreateModal = true"
          class="btn-primary"
        >
          Create Group
        </button>
      </div>
    </div>

    <div v-if="!authStore.isAuthenticated" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p class="text-blue-800">
        <router-link to="/login" class="text-blue-600 hover:text-blue-800 underline">
          Sign in
        </router-link> 
        to create groups and join matching sessions.
      </p>
    </div>

    <div v-else-if="!authStore.user?.isPro" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold text-yellow-800 mb-2">Pro Feature</h3>
      <p class="text-yellow-700">
        Groups and matching features are available to Pro users only. 
        Contact an administrator to upgrade your account.
      </p>
    </div>

    <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="animate-pulse">
        <div class="card">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <div v-else-if="groups.length === 0" class="text-center py-12">
      <UserGroupIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No groups available</h3>
      <p class="text-gray-500 mb-4">Be the first to create a matching group!</p>
      <button
        v-if="authStore.isAuthenticated"
        @click="showCreateModal = true"
        class="btn-primary"
      >
        Create First Group
      </button>
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in groups"
        :key="group.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewGroup(group)"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-semibold text-gray-900">{{ group.name }}</h3>
          <div class="flex gap-2">
            <span class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
              {{ group.matchingType }}
            </span>
            <!-- Expiration Status Badge -->
            <span v-if="isGroupExpired(group)" class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Expired
            </span>
            <!-- Expiring Soon Badge -->
            <span v-else-if="isGroupExpiringSoon(group)" class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Expiring Soon
            </span>
            <!-- Public/Private Badge -->
            <span v-if="group.isPublic" class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Public
            </span>
            <span v-else class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Private
            </span>
          </div>
        </div>
        
        <p v-if="group.description" class="text-gray-600 mb-4">{{ group.description }}</p>
        
        <!-- Public scope info -->
        <div v-if="group.isPublic && group.publicScope && hasPublicScopeFilters(group.publicScope)" class="mb-4">
          <div class="text-xs text-gray-500 mb-2">Public scope:</div>
          <div class="flex flex-wrap gap-1">
            <span v-if="group.publicScope.countries && group.publicScope.countries.length > 0" 
              class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              📍 {{ group.publicScope.countries.slice(0, 2).join(', ') }}{{ group.publicScope.countries.length > 2 ? ` +${group.publicScope.countries.length - 2}` : '' }}
            </span>
            <span v-if="group.publicScope.minAge || group.publicScope.maxAge" 
              class="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
              🎂 {{ formatAgeRange(group.publicScope) }}
            </span>
            <span v-if="group.publicScope.regions && group.publicScope.regions.length > 0" 
              class="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
              🌍 {{ group.publicScope.regions.slice(0, 2).join(', ') }}{{ group.publicScope.regions.length > 2 ? ` +${group.publicScope.regions.length - 2}` : '' }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{{ group.currentParticipants }}/{{ group.maxParticipants }} members</span>
          <span>{{ formatDate(group.createdAt) }}</span>
        </div>
        
        <!-- Retention Time Info -->
        <div v-if="group.retentionHours" class="text-sm mb-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Retention:</span>
            <span :class="[
              'font-medium',
              isGroupExpired(group) ? 'text-red-600' : 
              isGroupExpiringSoon(group) ? 'text-yellow-600' : 'text-green-600'
            ]">
              {{ getTimeUntilExpiration(group) || `${group.retentionHours}h total` }}
            </span>
          </div>
          <div v-if="isGroupExpired(group)" class="text-xs text-red-600 mt-1">
            🔒 Only visible to creator
          </div>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            class="bg-primary-600 h-2 rounded-full" 
            :style="{ width: `${(group.currentParticipants / group.maxParticipants) * 100}%` }"
          ></div>
        </div>

        <button 
          v-if="authStore.isAuthenticated"
          class="w-full"
          :class="isGroupExpired(group) ? 'btn-secondary' : 'btn-primary'"
          @click.stop="isGroupExpired(group) ? viewGroup(group) : joinGroup(group)"
          :disabled="!isGroupExpired(group) && group.currentParticipants >= group.maxParticipants"
        >
          {{ 
            isGroupExpired(group) ? 'View Comments' :
            group.currentParticipants >= group.maxParticipants ? 'Full' : 'Join Group' 
          }}
        </button>
        <div v-else class="text-center text-gray-500 text-sm">
          Sign in to join
        </div>
      </div>
    </div>

    <CreateGroupModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleGroupCreated"
    />

    <MatchingInfoModal
      v-if="showMatchingInfo"
      @close="showMatchingInfo = false"
    />

    <GroupDetailModal
      v-if="selectedGroup"
      :group="selectedGroup"
      @close="selectedGroup = null"
      @joined="handleGroupJoined"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserGroupIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import CreateGroupModal from '@/components/CreateGroupModal.vue'
import MatchingInfoModal from '@/components/MatchingInfoModal.vue'
import GroupDetailModal from '@/components/GroupDetailModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const groups = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const showMatchingInfo = ref(false)
const selectedGroup = ref(null)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const isGroupExpired = (group) => {
  if (!group.expiresAt) return false
  return new Date() > new Date(group.expiresAt)
}

const isGroupExpiringSoon = (group) => {
  if (!group.expiresAt || isGroupExpired(group)) return false
  const expirationTime = new Date(group.expiresAt).getTime()
  const currentTime = new Date().getTime()
  const oneHourInMs = 60 * 60 * 1000
  return (expirationTime - currentTime) <= oneHourInMs
}

const getTimeUntilExpiration = (group) => {
  if (!group.expiresAt) return null
  const expirationTime = new Date(group.expiresAt).getTime()
  const currentTime = new Date().getTime()
  const timeDiff = expirationTime - currentTime
  
  if (timeDiff <= 0) return 'Expired'
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} left`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`
  } else {
    return `${minutes}m left`
  }
}

const fetchGroups = async () => {
  try {
    loading.value = true
    const response = await api.get('/groups')
    groups.value = response.data.groups
  } catch (error) {
    console.error('Error fetching groups:', error)
  } finally {
    loading.value = false
  }
}

const viewGroup = async (group) => {
  try {
    const response = await api.get(`/groups/${group.id}`)
    selectedGroup.value = response.data.group
  } catch (error) {
    console.error('Error fetching group details:', error)
  }
}

const joinGroup = async (group) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await api.post(`/groups/${group.id}/join`)
    await fetchGroups()
    alert('Successfully joined group!')
  } catch (error) {
    console.error('Error joining group:', error)
    alert(error.response?.data?.error || 'Failed to join group')
  }
}

const handleGroupCreated = () => {
  showCreateModal.value = false
  fetchGroups()
}

const handleGroupJoined = () => {
  selectedGroup.value = null
  fetchGroups()
}

const hasPublicScopeFilters = (publicScope) => {
  if (!publicScope) return false
  return (publicScope.countries && publicScope.countries.length > 0) ||
         publicScope.minAge ||
         publicScope.maxAge ||
         (publicScope.regions && publicScope.regions.length > 0)
}

const formatAgeRange = (publicScope) => {
  if (publicScope.minAge && publicScope.maxAge) {
    return `${publicScope.minAge}-${publicScope.maxAge}`
  } else if (publicScope.minAge) {
    return `${publicScope.minAge}+`
  } else if (publicScope.maxAge) {
    return `≤${publicScope.maxAge}`
  }
  return ''
}

onMounted(() => {
  fetchGroups()
})
</script>
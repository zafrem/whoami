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
          <span class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {{ group.matchingType }}
          </span>
        </div>
        
        <p v-if="group.description" class="text-gray-600 mb-4">{{ group.description }}</p>
        
        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{{ group.currentParticipants }}/{{ group.maxParticipants }} members</span>
          <span>{{ formatDate(group.createdAt) }}</span>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            class="bg-primary-600 h-2 rounded-full" 
            :style="{ width: `${(group.currentParticipants / group.maxParticipants) * 100}%` }"
          ></div>
        </div>

        <button 
          v-if="authStore.isAuthenticated"
          class="btn-primary w-full"
          @click.stop="joinGroup(group)"
          :disabled="group.currentParticipants >= group.maxParticipants"
        >
          {{ group.currentParticipants >= group.maxParticipants ? 'Full' : 'Join Group' }}
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

onMounted(() => {
  fetchGroups()
})
</script>
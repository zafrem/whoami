<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{{ group.name }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <span class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
            {{ group.matchingType }} Matching
          </span>
          <span class="text-sm text-gray-500">
            Created {{ formatDate(group.createdAt) }}
          </span>
        </div>

        <div v-if="group.description" class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 mb-2">Description</h3>
          <p class="text-gray-600">{{ group.description }}</p>
        </div>

        <div class="bg-white border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-medium text-gray-900">Group Progress</h3>
            <span class="text-sm text-gray-600">
              {{ group.currentParticipants }}/{{ group.maxParticipants }} members
            </span>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-primary-600 h-3 rounded-full transition-all duration-300" 
              :style="{ width: `${(group.currentParticipants / group.maxParticipants) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-medium text-blue-900 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Anonymous Members
          </h3>
          <p class="text-blue-800 text-sm mb-3">
            Members are identified only by their anonymous hash for privacy.
          </p>
          
          <div v-if="group.memberHashes && group.memberHashes.length > 0" class="space-y-2">
            <div 
              v-for="(hash, index) in group.memberHashes" 
              :key="hash"
              class="flex items-center justify-between bg-white rounded px-3 py-2 text-sm"
            >
              <span class="font-mono text-gray-600">{{ formatHash(hash) }}</span>
              <span class="text-xs text-gray-400">Member {{ index + 1 }}</span>
            </div>
          </div>
          <p v-else class="text-blue-700 text-sm italic">
            No members yet. Be the first to join!
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="$emit('close')" class="btn-secondary">
            Close
          </button>
          <button 
            v-if="authStore.isAuthenticated"
            @click="joinGroup"
            :disabled="group.currentParticipants >= group.maxParticipants || joining"
            class="btn-primary"
          >
            {{ joining ? 'Joining...' : 
               group.currentParticipants >= group.maxParticipants ? 'Group Full' : 'Join Group' }}
          </button>
          <router-link 
            v-else
            to="/login" 
            class="btn-primary"
          >
            Sign in to Join
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'joined'])

const router = useRouter()
const authStore = useAuthStore()
const joining = ref(false)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const formatHash = (hash) => {
  return hash.slice(0, 8) + '...' + hash.slice(-4)
}

const joinGroup = async () => {
  try {
    joining.value = true
    await api.post(`/groups/${props.group.id}/join`)
    emit('joined')
  } catch (error) {
    console.error('Error joining group:', error)
    alert(error.response?.data?.error || 'Failed to join group')
  } finally {
    joining.value = false
  }
}
</script>
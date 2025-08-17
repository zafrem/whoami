<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Create New Group</h2>
      
      <form @submit.prevent="createGroup">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Group Name *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            maxlength="100"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter group name"
          >
        </div>

        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            maxlength="500"
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your group and what you're looking for"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ form.description.length }}/500 characters</p>
        </div>

        <div class="mb-4">
          <label for="maxParticipants" class="block text-sm font-medium text-gray-700 mb-1">
            Max Participants
          </label>
          <input
            id="maxParticipants"
            v-model.number="form.maxParticipants"
            type="number"
            min="2"
            max="20"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Matching Type *
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="form.matchingType"
                type="radio"
                value="1:1"
                class="text-primary-600"
              >
              <span class="ml-2">1:1 - One-to-one matching</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.matchingType"
                type="radio"
                value="1:N"
                class="text-primary-600"
              >
              <span class="ml-2">1:N - One-to-many matching</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !form.name || !form.matchingType"
            class="btn-primary"
          >
            {{ loading ? 'Creating...' : 'Create Group' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'created'])

const form = ref({
  name: '',
  description: '',
  maxParticipants: 10,
  matchingType: '1:N'
})

const loading = ref(false)

const createGroup = async () => {
  try {
    loading.value = true
    await api.post('/groups', form.value)
    emit('created')
  } catch (error) {
    console.error('Error creating group:', error)
    alert(error.response?.data?.error || 'Failed to create group')
  } finally {
    loading.value = false
  }
}
</script>
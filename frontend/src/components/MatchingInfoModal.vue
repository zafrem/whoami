<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Matching Types Explained</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading matching information...</p>
      </div>

      <div v-else-if="matchingInfo" class="grid md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-3">1:1</span>
              {{ matchingInfo['1:1'].title }}
            </h3>
            
            <div class="mb-4">
              <h4 class="font-medium text-green-700 mb-2">Pros:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="pro in matchingInfo['1:1'].pros" :key="pro">{{ pro }}</li>
              </ul>
            </div>

            <div class="mb-4">
              <h4 class="font-medium text-red-700 mb-2">Cons:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="con in matchingInfo['1:1'].cons" :key="con">{{ con }}</li>
              </ul>
            </div>

            <div>
              <h4 class="font-medium text-purple-700 mb-2">Best For:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="use in matchingInfo['1:1'].bestFor" :key="use">{{ use }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-3">1:N</span>
              {{ matchingInfo['1:N'].title }}
            </h3>
            
            <div class="mb-4">
              <h4 class="font-medium text-green-700 mb-2">Pros:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="pro in matchingInfo['1:N'].pros" :key="pro">{{ pro }}</li>
              </ul>
            </div>

            <div class="mb-4">
              <h4 class="font-medium text-red-700 mb-2">Cons:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="con in matchingInfo['1:N'].cons" :key="con">{{ con }}</li>
              </ul>
            </div>

            <div>
              <h4 class="font-medium text-purple-700 mb-2">Best For:</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li v-for="use in matchingInfo['1:N'].bestFor" :key="use">{{ use }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <button @click="$emit('close')" class="btn-primary">
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const matchingInfo = ref(null)
const loading = ref(true)

const fetchMatchingInfo = async () => {
  try {
    const response = await api.get('/groups/matching-info')
    matchingInfo.value = response.data
  } catch (error) {
    console.error('Error fetching matching info:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMatchingInfo()
})
</script>
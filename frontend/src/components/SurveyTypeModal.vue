<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-lg w-full p-6">
      <h3 class="text-xl font-semibold text-gray-900 mb-4 text-center">Select Survey Type</h3>
      <p class="text-gray-600 mb-6 text-center">Choose how comprehensive you want your personality assessment to be:</p>
      
      <div class="space-y-4">
        <div
          v-for="(typeConfig, typeKey) in survey.surveyTypes"
          :key="typeKey"
          class="border-2 rounded-lg p-4 cursor-pointer transition-colors hover:border-primary-300"
          :class="{
            'border-primary-500 bg-primary-50': selectedType === typeKey,
            'border-gray-200': selectedType !== typeKey
          }"
          @click="selectedType = typeKey"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900 capitalize">{{ getTypeDisplayName(typeKey) }}</h4>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {{ typeConfig.difficulty }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ typeConfig.description }}</p>
              <div class="flex items-center text-sm text-gray-500 space-x-6">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ typeConfig.questions }} questions
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{{ typeConfig.time }} minutes
                </div>
              </div>
            </div>
            <div
              class="ml-4 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              :class="{
                'border-primary-500 bg-primary-500': selectedType === typeKey,
                'border-gray-300': selectedType !== typeKey
              }"
            >
              <CheckIcon v-if="selectedType === typeKey" class="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="$emit('close')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="startSurvey"
          :disabled="!selectedType"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedType }"
        >
          Start {{ getTypeDisplayName(selectedType) }} Survey
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  survey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'select'])
const router = useRouter()

const selectedType = ref('general') // Default to general

watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedType.value = 'general' // Reset to default when opening
  }
})

const getTypeDisplayName = (typeKey) => {
  const names = {
    simple: 'Simple',
    general: 'General', 
    full: 'Full'
  }
  return names[typeKey] || typeKey
}

const startSurvey = () => {
  if (selectedType.value) {
    emit('select', selectedType.value)
    router.push({
      name: 'SurveyTake',
      params: { id: props.survey.id },
      query: { type: selectedType.value }
    })
  }
}
</script>
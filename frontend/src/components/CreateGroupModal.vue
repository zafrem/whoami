<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg p-6 w-full mx-4 transition-all duration-300 ease-in-out"
         :class="form.isPublic ? 'max-w-4xl' : 'max-w-md'">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Create New Group</h2>
      
      <div class="flex gap-6">
        <!-- Left side - Main form -->
        <div class="flex-1">
          <form @submit.prevent="createGroup">
            <!-- Matching Type - moved to top -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Matching Type *
              </label>
              <div class="space-y-3">
                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="form.matchingType"
                    type="radio"
                    value="1:1"
                    class="text-primary-600 mt-1"
                    @change="updateParticipantLimits"
                  >
                  <div class="ml-3">
                    <span class="font-medium">1:1 - One-to-one matching</span>
                    <p class="text-sm text-gray-600">Direct comparison between two individuals for focused compatibility assessment</p>
                  </div>
                </label>
                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="form.matchingType"
                    type="radio"
                    value="1:N"
                    class="text-primary-600 mt-1"
                    @change="updateParticipantLimits"
                  >
                  <div class="ml-3">
                    <span class="font-medium">1:N - One-to-many matching</span>
                    <p class="text-sm text-gray-600">Comprehensive analysis across multiple people for team building and group dynamics</p>
                  </div>
                </label>
              </div>
            </div>

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
                :min="participantLimits.min"
                :max="participantLimits.max"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
              <p class="text-xs text-gray-500 mt-1">
                {{ form.matchingType === '1:1' ? 'For 1:1 matching, only 2 participants are needed' : 'For 1:N matching, you can have 3-20 participants' }}
              </p>
            </div>

            <!-- Public Scope Toggle -->
            <div class="mb-6 border-t pt-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">
                  Make this group publicly discoverable
                </label>
                <!-- Toggle Switch -->
                <button
                  type="button"
                  @click="form.isPublic = !form.isPublic"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="form.isPublic ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out"
                    :class="form.isPublic ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Public groups can be discovered by users who meet your criteria
              </p>
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

        <!-- Right side - Public scope settings -->
        <div v-if="form.isPublic" class="flex-1 pl-6 border-l border-gray-200 slide-in-right">
          <div class="space-y-4">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Public Scope Settings</h3>
              <p class="text-sm text-gray-600">
                Set visibility criteria for your public group. Users must match all specified criteria to see and join this group.
              </p>
            </div>
            
            <!-- Countries -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Allowed Countries (optional)
              </label>
              <div class="flex flex-wrap gap-2 min-h-[2rem]">
                <div v-for="country in form.publicScope.countries" :key="country" class="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {{ country }}
                  <button @click="removeCountry(country)" type="button" class="ml-1 text-blue-600 hover:text-blue-800">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex mt-2">
                <select v-model="selectedCountry" class="form-input flex-1 text-sm">
                  <option value="">Select a country</option>
                  <option v-for="country in availableCountries" :key="country" :value="country">
                    {{ country }}
                  </option>
                </select>
                <button @click="addCountry" type="button" :disabled="!selectedCountry" class="ml-2 btn-secondary text-sm px-3">
                  Add
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Leave empty to allow all countries</p>
            </div>

            <!-- Age Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Age
                </label>
                <input
                  v-model.number="form.publicScope.minAge"
                  type="number"
                  min="13"
                  max="100"
                  class="form-input text-sm w-full"
                  placeholder="e.g., 18"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Age
                </label>
                <input
                  v-model.number="form.publicScope.maxAge"
                  type="number"
                  min="13"
                  max="100"
                  class="form-input text-sm w-full"
                  placeholder="e.g., 65"
                >
              </div>
            </div>
            <p class="text-xs text-gray-500">Leave empty to allow all ages (13+)</p>

            <!-- Regions -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Allowed Regions/Cities (optional)
              </label>
              <div class="flex flex-wrap gap-2 min-h-[2rem]">
                <div v-for="region in form.publicScope.regions" :key="region" class="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {{ region }}
                  <button @click="removeRegion(region)" type="button" class="ml-1 text-green-600 hover:text-green-800">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex mt-2">
                <input
                  v-model="newRegion"
                  type="text"
                  class="form-input flex-1 text-sm"
                  placeholder="Enter city or region"
                  @keypress.enter.prevent="addRegion"
                >
                <button @click="addRegion" type="button" :disabled="!newRegion.trim()" class="ml-2 btn-secondary text-sm px-3">
                  Add
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Leave empty to allow all regions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'created'])

const form = ref({
  name: '',
  description: '',
  maxParticipants: 10,
  matchingType: '1:N',
  isPublic: false,
  publicScope: {
    countries: [],
    minAge: null,
    maxAge: null,
    regions: []
  }
})

const loading = ref(false)
const selectedCountry = ref('')
const newRegion = ref('')

// Common countries list
const availableCountries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Japan', 'South Korea', 'Singapore', 'New Zealand', 'Switzerland',
  'Belgium', 'Austria', 'Ireland', 'Portugal', 'Finland', 'Poland',
  'Czech Republic', 'Hungary', 'Greece', 'Israel', 'Brazil', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'India', 'China', 'Taiwan', 'Thailand',
  'Malaysia', 'Philippines', 'Indonesia', 'Vietnam', 'Turkey', 'Russia',
  'Ukraine', 'South Africa', 'Egypt', 'Kenya', 'Nigeria', 'Morocco'
]

const participantLimits = computed(() => {
  if (form.value.matchingType === '1:1') {
    return { min: 2, max: 2 }
  } else {
    return { min: 3, max: 20 }
  }
})

const updateParticipantLimits = () => {
  if (form.value.matchingType === '1:1') {
    form.value.maxParticipants = 2
  } else if (form.value.maxParticipants === 2) {
    // If switching from 1:1 to 1:N, increase to minimum for 1:N
    form.value.maxParticipants = 5
  }
}

const addCountry = () => {
  if (selectedCountry.value && !form.value.publicScope.countries.includes(selectedCountry.value)) {
    form.value.publicScope.countries.push(selectedCountry.value)
    selectedCountry.value = ''
  }
}

const removeCountry = (country) => {
  const index = form.value.publicScope.countries.indexOf(country)
  if (index > -1) {
    form.value.publicScope.countries.splice(index, 1)
  }
}

const addRegion = () => {
  const region = newRegion.value.trim()
  if (region && !form.value.publicScope.regions.includes(region)) {
    form.value.publicScope.regions.push(region)
    newRegion.value = ''
  }
}

const removeRegion = (region) => {
  const index = form.value.publicScope.regions.indexOf(region)
  if (index > -1) {
    form.value.publicScope.regions.splice(index, 1)
  }
}

const createGroup = async () => {
  try {
    loading.value = true
    
    // Prepare form data with validated public scope
    const groupData = {
      name: form.value.name,
      description: form.value.description,
      maxParticipants: form.value.maxParticipants,
      matchingType: form.value.matchingType,
      isPublic: form.value.isPublic,
      publicScope: form.value.isPublic ? form.value.publicScope : null
    }
    
    await api.post('/groups', groupData)
    emit('created')
  } catch (error) {
    console.error('Error creating group:', error)
    alert(error.response?.data?.error || 'Failed to create group')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
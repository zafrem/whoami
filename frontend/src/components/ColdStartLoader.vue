<template>
  <div class="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="max-w-md w-full mx-auto p-6 text-center">
      <!-- Animated Logo -->
      <div class="mb-8">
        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full animate-pulse">
          </div>
          <div class="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="mb-6">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-primary-600">{{ currentStep.label }}</span>
          <span class="text-sm text-gray-500">{{ Math.round(progress) }}%</span>
        </div>
        
        <!-- Animated Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full transition-all duration-300 relative"
            :style="{ width: `${progress}%` }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Step Indicators -->
      <div class="flex justify-center space-x-2 mb-6">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="{
            'bg-primary-600 scale-110': index === currentStepIndex,
            'bg-primary-400': index < currentStepIndex,
            'bg-gray-300': index > currentStepIndex
          }"
        ></div>
      </div>

      <!-- Encouraging Messages -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-gray-900">{{ currentStep.title }}</h3>
        <p class="text-gray-600 text-sm">{{ currentStep.message }}</p>
        
        <!-- Fun Facts Rotation -->
        <div class="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <p class="text-xs text-primary-700 font-medium">💡 {{ t('loading.didYouKnow') }}</p>
          <p class="text-xs text-primary-600 mt-1">{{ currentFact }}</p>
        </div>
      </div>

      <!-- Time Indicator -->
      <div class="mt-6 text-xs text-gray-400">
        {{ t('loading.timeElapsed') }}: {{ formattedElapsedTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'general', // 'login', 'survey', 'results', 'general'
  }
})

const currentStepIndex = ref(0)
const startTime = ref(null)
const elapsedTime = ref(0)
const currentFactIndex = ref(0)
const timer = ref(null)
const factTimer = ref(null)

const steps = computed(() => {
  const stepMap = {
    login: [
      {
        label: t('loading.steps.connecting'),
        title: t('loading.steps.connectingTitle'),
        message: t('loading.steps.connectingMessage')
      },
      {
        label: t('loading.steps.authenticating'),
        title: t('loading.steps.authenticatingTitle'),
        message: t('loading.steps.authenticatingMessage')
      },
      {
        label: t('loading.steps.loading'),
        title: t('loading.steps.loadingTitle'),
        message: t('loading.steps.loadingMessage')
      }
    ],
    survey: [
      {
        label: t('loading.steps.waking'),
        title: t('loading.steps.wakingTitle'),
        message: t('loading.steps.wakingMessage')
      },
      {
        label: t('loading.steps.preparing'),
        title: t('loading.steps.preparingTitle'),
        message: t('loading.steps.preparingMessage')
      },
      {
        label: t('loading.steps.ready'),
        title: t('loading.steps.readyTitle'),
        message: t('loading.steps.readyMessage')
      }
    ],
    general: [
      {
        label: t('loading.steps.initializing'),
        title: t('loading.steps.initializingTitle'),
        message: t('loading.steps.initializingMessage')
      },
      {
        label: t('loading.steps.connecting'),
        title: t('loading.steps.connectingTitle'),
        message: t('loading.steps.connectingMessage')
      },
      {
        label: t('loading.steps.finalizing'),
        title: t('loading.steps.finalizingTitle'),
        message: t('loading.steps.finalizingMessage')
      }
    ]
  }
  return stepMap[props.type] || stepMap.general
})

const currentStep = computed(() => steps.value[currentStepIndex.value])

const progress = computed(() => {
  const baseProgress = (currentStepIndex.value / steps.value.length) * 100
  const stepProgress = Math.min(elapsedTime.value / 1000 * 10, 100 / steps.value.length)
  return Math.min(baseProgress + stepProgress, 95) // Never show 100% until actually done
})

const facts = computed(() => [
  t('loading.facts.personalityTypes'),
  t('loading.facts.surveyAccuracy'),
  t('loading.facts.behaviorPrediction'),
  t('loading.facts.culturalDifferences'),
  t('loading.facts.dataScience'),
  t('loading.facts.psychologyResearch')
])

const currentFact = computed(() => facts.value[currentFactIndex.value])

const formattedElapsedTime = computed(() => {
  const seconds = Math.floor(elapsedTime.value / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${remainingSeconds}s`
})

const startLoading = () => {
  startTime.value = Date.now()
  currentStepIndex.value = 0
  currentFactIndex.value = 0
  
  // Progress through steps
  timer.value = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
    
    // Auto-advance steps based on time
    const timeBasedStep = Math.min(
      Math.floor(elapsedTime.value / 2000), // 2 seconds per step
      steps.value.length - 1
    )
    currentStepIndex.value = timeBasedStep
  }, 100)
  
  // Rotate facts every 4 seconds
  factTimer.value = setInterval(() => {
    currentFactIndex.value = (currentFactIndex.value + 1) % facts.value.length
  }, 4000)
}

const stopLoading = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  if (factTimer.value) {
    clearInterval(factTimer.value)
    factTimer.value = null
  }
}

onMounted(() => {
  if (props.show) {
    startLoading()
  }
})

onUnmounted(() => {
  stopLoading()
})

// Watch for show prop changes
watch(() => props.show, (newShow) => {
  if (newShow) {
    startLoading()
  } else {
    stopLoading()
  }
})
</script>
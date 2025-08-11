<template>
  <div
    v-if="notification.show"
    class="fixed top-4 right-4 max-w-sm w-full bg-white border-l-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform"
    :class="notificationClasses"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <CheckCircleIcon v-if="notification.type === 'success'" class="w-5 h-5 text-green-400" />
          <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="w-5 h-5 text-yellow-400" />
          <XCircleIcon v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-400" />
          <InformationCircleIcon v-else class="w-5 h-5 text-blue-400" />
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-gray-900">
            {{ notification.title }}
          </p>
          <p v-if="notification.message" class="mt-1 text-sm text-gray-500">
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="hideNotification"
            class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const notification = reactive({
  show: false,
  type: 'info',
  title: '',
  message: '',
  timeout: null
})

const notificationClasses = computed(() => ({
  'border-green-500': notification.type === 'success',
  'border-yellow-500': notification.type === 'warning',
  'border-red-500': notification.type === 'error',
  'border-blue-500': notification.type === 'info'
}))

const showNotification = (type, title, message = '', duration = 5000) => {
  if (notification.timeout) {
    clearTimeout(notification.timeout)
  }

  notification.type = type
  notification.title = title
  notification.message = message
  notification.show = true

  if (duration > 0) {
    notification.timeout = setTimeout(() => {
      hideNotification()
    }, duration)
  }
}

const hideNotification = () => {
  notification.show = false
  if (notification.timeout) {
    clearTimeout(notification.timeout)
    notification.timeout = null
  }
}

window.showNotification = showNotification

defineExpose({
  showNotification,
  hideNotification
})
</script>
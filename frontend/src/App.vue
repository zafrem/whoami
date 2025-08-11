<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    
    <div class="flex flex-1">
      <AppSidebar v-if="showSidebar" />
      
      <main :class="mainClass">
        <router-view />
      </main>
    </div>
    
    <AppFooter />
    <AppNotification />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNotification from '@/components/AppNotification.vue'

const route = useRoute()
const authStore = useAuthStore()

const showSidebar = computed(() => {
  const hideSidebarRoutes = ['Login', 'Register']
  return !hideSidebarRoutes.includes(route.name) && (
    authStore.isAuthenticated || 
    ['SurveyTake', 'SurveyResult'].includes(route.name)
  )
})

const mainClass = computed(() => ({
  'flex-1': true,
  'ml-0': !showSidebar.value,
  'ml-64': showSidebar.value,
  'transition-all duration-300 ease-in-out': true
}))

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchProfile()
  }
})
</script>
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { useSurveyStore } from '@/stores/survey'
import { useAuthStore } from '@/stores/auth'

// Mock the stores
vi.mock('@/stores/survey')
vi.mock('@/stores/auth')

describe('AppSidebar', () => {
  let wrapper
  let router
  let surveyStore
  let authStore

  beforeEach(async () => {
    // Create fresh pinia instance
    const pinia = createPinia()
    setActivePinia(pinia)

    // Create router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/survey/:id', name: 'SurveyTake', component: { template: '<div>Survey</div>' } },
        { path: '/results', name: 'ResultsList', component: { template: '<div>Results</div>' } },
        { path: '/profile', name: 'Profile', component: { template: '<div>Profile</div>' } }
      ]
    })

    // Mock stores
    surveyStore = {
      surveys: [
        {
          id: '1',
          name: 'Test Survey 1',
          description: 'A test survey',
          category: 'personality',
          estimatedTime: 5,
          tags: ['test', 'personality']
        },
        {
          id: '2',
          name: 'Test Survey 2',
          description: 'Another test survey',
          category: 'psychology',
          estimatedTime: 10,
          tags: ['test']
        }
      ],
      loading: false,
      error: null,
      fetchSurveys: vi.fn(),
      refreshSurveys: vi.fn()
    }

    authStore = {
      isAuthenticated: false,
      user: null
    }

    // Mock the store composables
    useSurveyStore.mockReturnValue(surveyStore)
    useAuthStore.mockReturnValue(authStore)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  const createWrapper = (options = {}) => {
    return mount(AppSidebar, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a href="#" @click="$emit(\'click\')"><slot /></a>',
            props: ['to']
          }
        }
      },
      ...options
    })
  }

  describe('Component Rendering', () => {
    it('renders correctly with surveys', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('h2').text()).toBe('Available Surveys')
      expect(wrapper.findAll('.border.border-gray-200')).toHaveLength(2)
    })

    it('shows loading state', async () => {
      surveyStore.loading = true
      surveyStore.surveys = []
      
      wrapper = createWrapper()
      
      expect(wrapper.findAll('.animate-pulse')).toHaveLength(3)
    })

    it('shows error state with retry button', async () => {
      surveyStore.loading = false
      surveyStore.error = 'Failed to load surveys'
      surveyStore.surveys = []
      
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Failed to load surveys')
      expect(wrapper.find('button').text()).toBe('Retry')
    })

    it('shows empty state when no surveys', () => {
      surveyStore.loading = false
      surveyStore.error = null
      surveyStore.surveys = []
      
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('No surveys available')
    })
  })

  describe('Survey Display', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('displays survey information correctly', () => {
      const firstSurvey = wrapper.findAll('.border.border-gray-200')[0]
      
      expect(firstSurvey.find('h3').text()).toBe('Test Survey 1')
      expect(firstSurvey.text()).toContain('A test survey')
      expect(firstSurvey.text()).toContain('personality')
      expect(firstSurvey.text()).toContain('5min')
    })

    it('displays survey tags correctly', () => {
      const firstSurvey = wrapper.findAll('.border.border-gray-200')[0]
      const tags = firstSurvey.findAll('.bg-primary-100')
      
      expect(tags).toHaveLength(2)
      expect(tags[0].text()).toBe('test')
      expect(tags[1].text()).toBe('personality')
    })

    it('limits displayed tags and shows count', () => {
      // Add a survey with many tags
      surveyStore.surveys = [{
        id: '3',
        name: 'Multi-tag Survey',
        description: 'Survey with many tags',
        category: 'test',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      }]
      
      wrapper = createWrapper()
      
      const survey = wrapper.find('.border.border-gray-200')
      const tags = survey.findAll('.bg-primary-100')
      const extraCount = survey.find('.inline-flex.items-center.px-2.py-0\\.5.text-xs.text-gray-500')
      
      expect(tags).toHaveLength(2) // Only first 2 tags shown
      expect(extraCount.text()).toBe('+3') // Remaining count
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('calls fetchSurveys on mount', () => {
      expect(surveyStore.fetchSurveys).toHaveBeenCalledWith({ active: 'true' })
    })

    it('calls refreshSurveys on retry button click', async () => {
      surveyStore.error = 'Network error'
      surveyStore.surveys = []
      
      wrapper = createWrapper()
      
      await wrapper.find('button').trigger('click')
      
      expect(surveyStore.refreshSurveys).toHaveBeenCalledWith({ active: 'true' })
    })

    it('navigates to survey on survey click', async () => {
      const routerPush = vi.spyOn(router, 'push')
      
      await wrapper.findAll('.border.border-gray-200')[0].trigger('click')
      
      expect(routerPush).toHaveBeenCalledWith({
        name: 'SurveyTake',
        params: { id: '1' }
      })
    })
  })

  describe('Authentication States', () => {
    it('shows quick links when authenticated', () => {
      authStore.isAuthenticated = true
      
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Quick Links')
      expect(wrapper.text()).toContain('My Results')
      expect(wrapper.text()).toContain('Profile')
    })

    it('hides quick links when not authenticated', () => {
      authStore.isAuthenticated = false
      
      wrapper = createWrapper()
      
      expect(wrapper.text()).not.toContain('Quick Links')
      expect(wrapper.text()).not.toContain('My Results')
    })
  })

  describe('Responsive Behavior', () => {
    it('has proper CSS classes for fixed positioning', () => {
      wrapper = createWrapper()
      
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('fixed')
      expect(aside.classes()).toContain('left-0')
      expect(aside.classes()).toContain('top-16')
      expect(aside.classes()).toContain('w-64')
    })

    it('handles overflow with scroll', () => {
      wrapper = createWrapper()
      
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('overflow-y-auto')
    })
  })

  describe('Error Handling', () => {
    it('handles missing survey data gracefully', () => {
      surveyStore.surveys = [
        {
          id: '1',
          name: 'Incomplete Survey'
          // Missing other properties
        }
      ]
      
      wrapper = createWrapper()
      
      expect(wrapper.find('h3').text()).toBe('Incomplete Survey')
      // Should not crash when accessing missing properties
    })

    it('handles null surveys array', () => {
      surveyStore.surveys = null
      
      expect(() => {
        wrapper = createWrapper()
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has proper CSS classes for interaction', () => {
      const surveys = wrapper.findAll('.border.border-gray-200')
      
      surveys.forEach(survey => {
        expect(survey.classes()).toContain('cursor-pointer')
        expect(survey.classes()).toContain('hover:shadow-md')
      })
    })

    it('has clickable survey elements', async () => {
      const firstSurvey = wrapper.findAll('.border.border-gray-200')[0]
      const routerPush = vi.spyOn(router, 'push')
      
      // Should be clickable
      await firstSurvey.trigger('click')
      
      expect(routerPush).toHaveBeenCalledWith({
        name: 'SurveyTake',
        params: { id: '1' }
      })
    })
  })

  describe('Performance', () => {
    it('displays surveys from store correctly', () => {
      wrapper = createWrapper()
      
      // Verify that the component uses the surveys from the store
      expect(wrapper.text()).toContain('Test Survey 1')
      expect(wrapper.text()).toContain('Test Survey 2')
      expect(wrapper.findAll('.border.border-gray-200')).toHaveLength(2)
    })

    it('does not make unnecessary API calls', () => {
      // Create multiple instances
      const wrapper1 = createWrapper()
      const wrapper2 = createWrapper()
      
      // Should only call fetchSurveys once per instance due to caching
      expect(surveyStore.fetchSurveys).toHaveBeenCalledTimes(2)
      
      wrapper1.unmount()
      wrapper2.unmount()
    })
  })
})
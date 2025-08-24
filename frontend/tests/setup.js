import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import '@testing-library/jest-dom'

// Create global test instances
const pinia = createPinia()
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close'
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        username: 'Username'
      },
      survey: {
        title: 'Survey',
        question: 'Question',
        answer: 'Answer',
        submit: 'Submit',
        next: 'Next',
        previous: 'Previous',
        start: 'Start Survey',
        complete: 'Complete Survey'
      }
    }
  }
})

// Configure global plugins for all tests
config.global.plugins = [pinia, i18n]

// Set active pinia instance
setActivePinia(pinia)

// Mock window.showNotification for tests
window.showNotification = vi.fn()

// Mock console methods to avoid test noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.sessionStorage = sessionStorageMock

// Mock fetch for API calls
global.fetch = vi.fn()

// Setup default fetch responses
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
  
  // Default fetch response
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => ''
  })
  
  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockImplementation(() => {})
  localStorageMock.removeItem.mockImplementation(() => {})
  localStorageMock.clear.mockImplementation(() => {})
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.setItem.mockImplementation(() => {})
  sessionStorageMock.removeItem.mockImplementation(() => {})
  sessionStorageMock.clear.mockImplementation(() => {})
})
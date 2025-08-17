import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Profile = () => import('@/views/Profile.vue')
const SurveyList = () => import('@/views/SurveyList.vue')
const SurveyTake = () => import('@/views/SurveyTake.vue')
const SurveyResult = () => import('@/views/SurveyResult.vue')
const ResultsList = () => import('@/views/ResultsList.vue')
const ResultCompare = () => import('@/views/ResultCompare.vue')
const Admin = () => import('@/views/Admin.vue')
const Groups = () => import('@/views/Groups.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/surveys',
    name: 'SurveyList',
    component: SurveyList,
    meta: { requiresAuth: false }
  },
  {
    path: '/survey/:id',
    name: 'SurveyTake',
    component: SurveyTake,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/embed/:id',
    name: 'SurveyEmbed',
    component: SurveyTake,
    props: route => ({ id: route.params.id, embedded: true }),
    meta: { requiresAuth: false, embedded: true }
  },
  {
    path: '/result/:id',
    name: 'SurveyResult',
    component: SurveyResult,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/results',
    name: 'ResultsList',
    component: ResultsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/results/compare/:id1/:id2',
    name: 'ResultCompare',
    component: ResultCompare,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups,
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }
  
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const guestOnly = to.meta.guestOnly
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (requiresAdmin && (!isAuthenticated || authStore.user?.role !== 'admin')) {
    next({ name: 'Home' })
  } else if (guestOnly && isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
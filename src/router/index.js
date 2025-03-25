import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SurveyCreateView from '@/views/SurveyCreateView.vue'
import SurveysView from '@/views/SurveysView.vue'
import SurveyLayout from '@/layouts/SurveyLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ScheduleCreateView from '@/views/ScheduleCreateView.vue'
import SurveyEditView from '@/views/SurveyEditView.vue'
import SurveyAnswerView from '@/views/SurveyAnswerView.vue'
import SchedulesView from '@/views/SchedulesView.vue'
import ScheduleEditView from '@/views/ScheduleEditView.vue'
import NotFoundView from '@/views/404View.vue'
import { useAuthStore } from '../stores/useAuthStore'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.authData) {
          next('/')
        } else {
          next()
        }
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.authData) {
          next('/')
        } else {
          next()
        }
      },
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: ResetPasswordView,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.authData) {
          next('/')
        } else {
          next()
        }
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/surveys',
      name: 'surveys',
      component: SurveysView,
      meta: { requiresAuth: true },
    },
    {
      path: '/survey/create',
      name: 'survey-create',
      component: SurveyCreateView,
      meta: { requiresAuth: true, requiresVerification: true },
    },
    {
      path: '/survey/edit/:public_id',
      name: 'survey-edit',
      component: SurveyEditView,
      meta: { requiresAuth: true, requiresVerification: true },
    },
    {
      path: '/survey/:public_id',
      name: 'survey',
      component: SurveyLayout,
      meta: { requiresAuth: false },
    },
    {
      path: '/survey/answer/:public_id',
      name: 'survey-answer',
      component: SurveyAnswerView,
      meta: { requiresAuth: true, requiresVerification: true },
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: SchedulesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule/create',
      name: 'schedule-create',
      component: ScheduleCreateView,
      meta: { requiresAuth: true, requiresVerification: true },
    },
    {
      path: '/schedule/edit',
      name: 'schedule-edit',
      component: ScheduleEditView,
      meta: { requiresAuth: true, requiresVerification: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.authData && !authStore.emailVerified) {
    await authStore.restoreAuth().catch(() => {
      authStore.logout()
    })
  }

  if (to.meta.requiresAuth === true) {
    if (!authStore.authData) {
      next('/login')
    } else if (to.meta.requiresVerification === true && !authStore.emailVerified) {
      next({
        path: '/profile',
        query: { redirectReason: 'emailNotVerified' },
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

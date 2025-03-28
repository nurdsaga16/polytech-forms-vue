<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue' // Изменяем ref на computed
import { useAuthStore } from './stores/useAuthStore'
import { useProfileStore } from './stores/useProfileStore'

const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Делаем isSurveyPage и isNotFoundPage реактивными через computed
const isSurveyPage = computed(() => route.name === 'survey')
const isNotFoundPage = computed(() => route.name === 'not-found')

// Состояние темы
const theme = ref(localStorage.getItem('theme') || 'night')

// Функция для переключения темы
const toggleTheme = () => {
  theme.value = theme.value === 'night' ? 'winter' : 'night'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

// Функция для выхода из системы
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error)
  }
}

// Инициализация темы при загрузке
document.documentElement.setAttribute('data-theme', theme.value)

// Загрузка данных профиля при изменении состояния авторизации
watch(
  () => authStore.authData?.userId,
  (newUserId) => {
    if (newUserId) {
      profileStore.fetchUserData(newUserId)
    }
  },
  { immediate: true },
)
</script>

<template>
  <!-- Основное содержимое -->
  <div class="wrapper">
    <header v-if="!isSurveyPage && !isNotFoundPage" class="navbar bg-base-100 shadow-lg">
      <div class="navbar-start">
        <div class="dropdown" v-if="authStore.authData">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <RouterLink to="/schedules" class="flex items-center gap-2">
                <i class="fa-solid fa-calendar"></i>
                Мои графики
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/surveys" class="flex items-center gap-2">
                <i class="fa-solid fa-clipboard-list"></i>
                Мои опросы
              </RouterLink>
            </li>
          </ul>
        </div>
        <RouterLink to="/" class="flex items-center gap-2">
          <img
            src="./assets/img/logo-polytech.svg"
            alt="Polytech Forms"
            class="w-8 inline-block align-middle logo"
          />
          <span class="text-2xl font-bold text-white hidden sm:inline-block align-middle logo"
            >Forms</span
          >
        </RouterLink>
      </div>
      <div class="navbar-center hidden lg:flex" v-if="authStore.authData">
        <ul class="menu menu-horizontal px-1">
          <li>
            <RouterLink to="/schedules" class="flex items-center gap-2">
              <i class="fa-solid fa-calendar"></i>
              Мои графики
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/surveys" class="flex items-center gap-2">
              <i class="fa-solid fa-clipboard-list"></i>
              Мои опросы
            </RouterLink>
          </li>
        </ul>
      </div>
      <div class="navbar-end gap-2">
        <label class="swap swap-rotate">
          <input
            type="checkbox"
            class="theme-controller"
            :checked="theme === 'light'"
            @change="toggleTheme"
          />
          <svg
            class="swap-off h-7 w-7 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
            />
          </svg>
          <svg
            class="swap-on h-7 w-7 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
            />
          </svg>
        </label>
        <template v-if="!authStore.authData">
          <RouterLink to="/login" class="btn btn-primary">
            <i class="fa-solid fa-right-to-bracket mr-2"></i>
            Войти
          </RouterLink>
        </template>
        <template v-else>
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <!-- Анимация загрузки аватарки -->
                <div
                  v-if="profileStore.loading || !profileStore.userData?.avatar"
                  class="w-10 h-10 bg-base-300 rounded-full animate-pulse"
                ></div>
                <img
                  v-else
                  :src="profileStore.userData.avatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <RouterLink to="/profile" class="flex items-center gap-2 text-sm">
                  <i class="fa-solid fa-user"></i>
                  Профиль
                </RouterLink>
              </li>
              <li>
                <a class="flex items-center gap-2 text-sm text-error" @click="handleLogout">
                  <i class="fa-solid fa-right-from-bracket"></i>
                  Выйти
                </a>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer
      v-if="!isSurveyPage && !isNotFoundPage"
      class="footer footer-center p-4 bg-base-200 text-base-content"
    >
      <aside>
        <div class="flex items-center gap-2 mb-2">
          <img
            src="./assets/img/logo-polytech.svg"
            alt="Polytech Forms"
            class="w-6 inline-block align-middle logo"
          />
          <span class="text-xl font-bold text-white hidden sm:inline-block align-middle logo"
            >Forms</span
          >
        </div>
        <p>Copyright © {{ new Date().getFullYear() }} - Все права защищены</p>
      </aside>
      <nav v-if="authStore.authData">
        <div class="grid grid-flow-col gap-4">
          <RouterLink to="/schedules" class="link link-hover">Мои графики</RouterLink>
          <RouterLink to="/surveys" class="link link-hover">Мои опросы</RouterLink>
        </div>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>

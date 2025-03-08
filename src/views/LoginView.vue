<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async (e) => {
  e.preventDefault()
  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при входе'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login flex items-center justify-center bg-base-200">
    <div class="w-full max-w-md p-4 sm:p-8 bg-base-100 rounded-2xl shadow-xl">
      <!-- Логотип и заголовок -->
      <div class="text-center mb-6 sm:mb-8">
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-base-200 rounded-full flex items-center justify-center"
        >
          <i class="fa-solid fa-right-to-bracket text-2xl sm:text-3xl text-primary"></i>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-base-content">Добро пожаловать</h2>
        <p class="text-sm sm:text-base text-base-content/70 mt-2">Войдите в свой аккаунт</p>
      </div>

      <form @submit="handleSubmit" autocomplete="off" novalidate class="space-y-4 sm:space-y-6">
        <!-- Поле Email -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm sm:text-base font-medium">Почта</span>
          </label>
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/50 z-10"
            >
              <i class="fa-solid fa-envelope text-sm sm:text-base"></i>
            </span>
            <input
              v-model="email"
              type="email"
              placeholder="example@email.com"
              class="input input-bordered w-full pl-10 text-sm sm:text-base h-10 sm:h-12"
              required
            />
          </div>
        </div>

        <!-- Поле Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm sm:text-base font-medium">Пароль</span>
          </label>
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/50 z-10"
            >
              <i class="fa-solid fa-lock text-sm sm:text-base"></i>
            </span>
            <input
              v-model="password"
              type="password"
              placeholder="Ваш пароль"
              class="input input-bordered w-full pl-10 text-sm sm:text-base h-10 sm:h-12"
              required
            />
          </div>
        </div>

        <!-- Сообщение об ошибке -->
        <div v-if="error" class="alert alert-error text-sm sm:text-base">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Кнопка входа -->
        <button
          type="submit"
          class="btn btn-primary w-full h-10 sm:h-12 text-base sm:text-lg font-medium"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <span class="loading loading-spinner loading-sm"></span>
            <span class="ml-2">Вход...</span>
          </template>
          <template v-else> Войти </template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: calc(100vh - 64px - 88px);
  padding: 1rem;
}

.form-control .relative span {
  z-index: 10;
}

/* Адаптивные стили */
@media (max-width: 640px) {
  .login {
    padding: 0.5rem;
  }

  .w-full.max-w-md {
    padding: 1.5rem;
  }

  .w-20.h-20 {
    width: 4rem;
    height: 4rem;
  }

  .text-3xl {
    font-size: 1.5rem;
  }

  .text-lg {
    font-size: 1rem;
  }

  .h-12 {
    height: 2.75rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .login {
    padding: 2rem;
  }

  .w-full.max-w-md {
    padding: 2rem;
  }

  .w-20.h-20 {
    width: 5rem;
    height: 5rem;
  }
}
</style>

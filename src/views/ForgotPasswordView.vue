<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const error = ref('')

const handleSubmit = async (e) => {
  e.preventDefault() // Дополнительная страховка
  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    await authStore.forgotPassword(email.value)
    successMessage.value = 'Ссылка для сброса пароля отправлена на вашу почту'
    email.value = '' // Очищаем поле после успешной отправки
  } catch (err) {
    error.value = err.message || 'Произошла ошибка'
    console.error('Ошибка при отправке запроса:', err) // Логируем ошибку для отладки
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="forgot-password flex items-center justify-center bg-base-200">
    <div class="w-full max-w-md p-4 sm:p-8 bg-base-100 rounded-2xl shadow-xl">
      <!-- Логотип и заголовок -->
      <div class="text-center mb-6 sm:mb-8">
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-base-200 rounded-full flex items-center justify-center"
        >
          <i class="fa-solid fa-key text-2xl sm:text-3xl text-primary"></i>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-base-content">Сброс пароля</h2>
        <p class="text-sm sm:text-base text-base-content/70 mt-2">
          Введите email для восстановления доступа
        </p>
      </div>

      <form
        @submit.prevent="handleSubmit"
        autocomplete="off"
        novalidate
        class="space-y-4 sm:space-y-6"
      >
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

        <!-- Сообщение об успехе -->
        <div v-if="successMessage" class="alert alert-success text-sm sm:text-base">
          <i class="fa-solid fa-check-circle"></i>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Сообщение об ошибке -->
        <div v-if="error" class="alert alert-error text-sm sm:text-base">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Кнопка отправки -->
        <button
          type="submit"
          class="btn btn-primary w-full h-10 sm:h-12 text-base sm:text-lg font-medium"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <span class="loading loading-spinner loading-sm"></span>
            <span class="ml-2">Отправка...</span>
          </template>
          <template v-else> Отправить </template>
        </button>

        <!-- Ссылка назад на логин -->
        <div class="text-center">
          <router-link
            to="/login"
            class="text-sm text-primary hover:underline hover:text-primary-focus transition-colors"
          >
            Вернуться к входу
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgot-password {
  min-height: calc(100vh - 64px - 101.53px);
  padding: 1rem;
}

.form-control .relative span {
  z-index: 10;
}

@media (max-width: 640px) {
  .forgot-password {
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
  .forgot-password {
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

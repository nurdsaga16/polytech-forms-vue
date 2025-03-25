<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  token: '',
  email: '', // Будет заполнено автоматически
  password: '',
  password_confirmation: '',
})

// Получаем параметры из URL
onMounted(() => {
  if (!route.params.token) {
    router.push('/login')
    return
  }

  form.value.token = route.params.token
  form.value.email = route.query.email || '' // Автоматически берем email из URL
})

const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Пароли не совпадают'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await authStore.resetPassword(form.value)
    router.push('/login?password_reset=success')
  } catch (err) {
    error.value = err.message || 'Ошибка при сбросе пароля'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="reset-password flex items-center justify-center bg-base-200 p-4">
    <div class="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-6 sm:p-8">
      <div class="text-center mb-6">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center"
        >
          <i class="fa-solid fa-key text-2xl text-primary"></i>
        </div>
        <h2 class="text-2xl font-bold">Новый пароль для {{ form.email }}</h2>
        <p class="text-sm text-gray-500 mt-2">Введите новый пароль для вашего аккаунта</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Только поля пароля (email скрыт, но передается) -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Новый пароль</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            class="input input-bordered w-full"
            placeholder="Не менее 8 символов"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Подтвердите пароль</span>
          </label>
          <input
            v-model="form.password_confirmation"
            type="password"
            required
            minlength="8"
            class="input input-bordered w-full"
            placeholder="Повторите новый пароль"
          />
        </div>

        <div v-if="error" class="alert alert-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ error }}</span>
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner"></span>
          {{ isLoading ? 'Сохраняем...' : 'Сохранить пароль' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reset-password {
  min-height: calc(100vh - 64px - 101.53px);
  padding: 1rem;
}

.form-control .relative span {
  z-index: 10;
}

/* Адаптивные стили */
@media (max-width: 640px) {
  .reset-password {
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
  .reset-password {
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

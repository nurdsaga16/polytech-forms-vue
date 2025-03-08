<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isHovered = ref(false)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-100">
    <div class="text-center">
      <!-- Анимированная иконка -->
      <div class="relative mb-8" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div
          class="w-48 h-48 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-all duration-500"
          :class="{ 'scale-110': isHovered }"
        >
          <i
            class="fa-solid fa-triangle-exclamation text-8xl text-primary transition-all duration-500"
            :class="{ 'rotate-12': isHovered }"
          ></i>
        </div>
      </div>

      <!-- Текст ошибки -->
      <h1 class="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-3xl font-semibold mb-4">Страница не найдена</h2>
      <p class="text-base-content/70 text-lg mb-8 max-w-md mx-auto">
        Извините, но страница, которую вы ищете, не существует или была перемещена.
      </p>

      <!-- Кнопка возврата -->
      <button
        class="btn btn-primary btn-lg gap-2 transition-all duration-300 hover:scale-105"
        @click="router.push('/')"
      >
        <i class="fa-solid fa-house"></i>
        Вернуться на главную
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.relative {
  animation: float 3s ease-in-out infinite;
}
</style>

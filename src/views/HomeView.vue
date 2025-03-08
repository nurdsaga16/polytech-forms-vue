<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Анимация появления элементов при скролле
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      })
    },
    { threshold: 0.1 },
  )

  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Главный баннер -->
    <header
      class="hero min-h-[90vh] bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10"
    >
      <div class="hero-content text-center px-4">
        <div class="max-w-3xl animate-on-scroll">
          <h1
            class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            Создавайте анонимные опросы для получения честной обратной связи
          </h1>
          <p class="py-4 sm:py-6 text-base sm:text-lg md:text-xl text-base-content/80">
            Простой и удобный конструктор форм для сбора обратной связи от студентов и
            преподавателей
          </p>
          <div class="flex gap-4 justify-center">
            <RouterLink to="/survey/create" class="btn btn-primary btn-md sm:btn-lg">
              Создать опрос
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Преимущества -->
    <section class="py-12 sm:py-16 md:py-20 bg-base-100">
      <div class="container mx-auto px-4">
        <h2
          class="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 animate-on-scroll"
        >
          Почему выбирают нас?
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <!-- Карточка 1 -->
          <div
            class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-on-scroll"
          >
            <div class="card-body text-center p-4 sm:p-6">
              <div class="flex justify-center mb-3 sm:mb-4">
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-6 h-6 sm:w-8 sm:h-8 text-primary"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 class="card-title justify-center text-lg sm:text-xl">Простота использования</h3>
              <p class="text-sm sm:text-base text-base-content/70">
                Интуитивно понятный интерфейс позволяет создавать формы за считанные минуты
              </p>
            </div>
          </div>

          <!-- Карточка 2 -->
          <div
            class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-on-scroll"
          >
            <div class="card-body text-center p-4 sm:p-6">
              <div class="flex justify-center mb-3 sm:mb-4">
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-6 h-6 sm:w-8 sm:h-8 text-primary"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 class="card-title justify-center text-lg sm:text-xl">Анонимность</h3>
              <p class="text-sm sm:text-base text-base-content/70">
                Гарантируем полную конфиденциальность данных респондентов
              </p>
            </div>
          </div>

          <!-- Карточка 3 -->
          <div
            class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-on-scroll"
          >
            <div class="card-body text-center p-4 sm:p-6">
              <div class="flex justify-center mb-3 sm:mb-4">
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-6 h-6 sm:w-8 sm:h-8 text-primary"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 class="card-title justify-center text-lg sm:text-xl">Аналитика</h3>
              <p class="text-sm sm:text-base text-base-content/70">
                Получайте подробную статистику и анализируйте результаты
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="py-12 sm:py-16 md:py-20 bg-base-200">
      <div class="container mx-auto px-4">
        <h2
          class="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 animate-on-scroll"
        >
          Как это работает?
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div class="text-center animate-on-scroll">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4"
            >
              1
            </div>
            <h3 class="text-lg sm:text-xl font-bold mb-2">Создайте опрос</h3>
            <p class="text-sm sm:text-base text-base-content/70">
              Выберите тип опроса и настройте вопросы
            </p>
          </div>
          <div class="text-center animate-on-scroll">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4"
            >
              2
            </div>
            <h3 class="text-lg sm:text-xl font-bold mb-2">Поделитесь ссылкой</h3>
            <p class="text-sm sm:text-base text-base-content/70">
              Отправьте ссылку на опрос участникам
            </p>
          </div>
          <div class="text-center animate-on-scroll">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4"
            >
              3
            </div>
            <h3 class="text-lg sm:text-xl font-bold mb-2">Собирайте ответы</h3>
            <p class="text-sm sm:text-base text-base-content/70">
              Получайте анонимные ответы от респондентов
            </p>
          </div>
          <div class="text-center animate-on-scroll">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4"
            >
              4
            </div>
            <h3 class="text-lg sm:text-xl font-bold mb-2">Анализируйте</h3>
            <p class="text-sm sm:text-base text-base-content/70">
              Изучайте результаты и принимайте решения
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Призыв к действию -->
    <section class="py-12 sm:py-16 md:py-20 bg-base-100">
      <div class="container mx-auto px-4 text-center">
        <div class="max-w-2xl mx-auto animate-on-scroll">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Готовы начать собирать обратную связь?
          </h2>
          <p class="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-base-content/70">
            Создайте свой первый опрос прямо сейчас и получите ценные отзывы от студентов
          </p>
          <RouterLink to="/survey/create" class="btn btn-primary btn-md sm:btn-lg">
            Создать опрос
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.animate-fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Задержка анимации для карточек */
.card:nth-child(1) {
  transition-delay: 0.1s;
}
.card:nth-child(2) {
  transition-delay: 0.2s;
}
.card:nth-child(3) {
  transition-delay: 0.3s;
}
</style>

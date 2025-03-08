<script setup>
import { ref } from 'vue'

// Имитация данных опроса (в реальном приложении будут приходить с сервера)
const survey = ref({
  title: 'Оценка качества преподавания',
  description: 'Пожалуйста, ответьте на вопросы о качестве преподавания в текущем семестре',
  blocks: [
    {
      type: 'multiple_choice',
      question: 'Как вы оцениваете качество преподавания?',
      description: 'Выберите наиболее подходящий вариант',
      options: ['Отлично', 'Хорошо', 'Удовлетворительно', 'Плохо'],
    },
    {
      type: 'text',
      question: 'Какие аспекты преподавания вы хотели бы улучшить?',
      description: 'Опишите ваши предложения по улучшению',
    },
    {
      type: 'rating',
      question: 'Оцените уровень сложности материала',
      description: '1 - слишком просто, 10 - слишком сложно',
      min: 1,
      max: 10,
      min_label: 'Слишком просто',
      max_label: 'Слишком сложно',
    },
  ],
})

// Состояние для ответов
const answers = ref([])
const currentBlock = ref(0)
const isCompleted = ref(false)

// Инициализация массива ответов
const initializeAnswers = () => {
  answers.value = survey.value.blocks.map((block) => {
    switch (block.type) {
      case 'multiple_choice':
        return ''
      case 'text':
        return ''
      case 'rating':
        return 5
      default:
        return null
    }
  })
}

// Переход к следующему вопросу
const nextBlock = () => {
  if (currentBlock.value < survey.value.blocks.length - 1) {
    currentBlock.value++
  } else {
    submitSurvey()
  }
}

// Переход к предыдущему вопросу
const prevBlock = () => {
  if (currentBlock.value > 0) {
    currentBlock.value--
  }
}

// Отправка ответов
const submitSurvey = () => {
  // Здесь будет логика отправки ответов на сервер
  console.log('Ответы:', answers.value)
  isCompleted.value = true
}

// Инициализация при загрузке компонента
initializeAnswers()
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 max-w-3xl py-8">
      <!-- Заголовок опроса -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-4">{{ survey.title }}</h1>
        <p class="text-base-content/70">{{ survey.description }}</p>
      </div>

      <!-- Прогресс-бар -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm">Вопрос {{ currentBlock + 1 }} из {{ survey.blocks.length }}</span>
          <span class="text-sm"
            >{{ Math.round(((currentBlock + 1) / survey.blocks.length) * 100) }}%</span
          >
        </div>
        <progress
          class="progress progress-primary w-full"
          :value="((currentBlock + 1) / survey.blocks.length) * 100"
          max="100"
        ></progress>
      </div>

      <!-- Вопросы -->
      <div v-if="!isCompleted" class="space-y-8">
        <div
          v-for="(block, index) in survey.blocks"
          :key="index"
          v-show="currentBlock === index"
          class="card bg-base-100 shadow-xl"
        >
          <div class="card-body">
            <h2 class="card-title mb-6">{{ block.question }}</h2>

            <!-- Варианты ответов -->
            <div v-if="block.type === 'multiple_choice'" class="space-y-4">
              <div v-for="option in block.options" :key="option" class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    type="radio"
                    :name="'question-' + index"
                    class="radio radio-primary"
                    v-model="answers[index]"
                    :value="option"
                  />
                  <span class="label-text">{{ option }}</span>
                </label>
              </div>
            </div>

            <!-- Текстовый ответ -->
            <div v-else-if="block.type === 'text'" class="form-control w-full">
              <textarea
                v-model="answers[index]"
                class="textarea textarea-bordered w-full resize-y min-h-[100px]"
                placeholder="Введите ваш ответ..."
              ></textarea>
            </div>

            <!-- Шкала оценки -->
            <div v-else-if="block.type === 'rating'" class="space-y-4">
              <div class="flex justify-between text-sm">
                <span>{{ block.min_label }}</span>
                <span>{{ block.max_label }}</span>
              </div>
              <input
                type="range"
                :min="block.min"
                :max="block.max"
                v-model="answers[index]"
                class="range range-primary w-full"
              />
              <div class="text-center text-lg font-bold">{{ answers[index] }}</div>
            </div>
          </div>
        </div>

        <!-- Кнопки навигации -->
        <div class="flex justify-between mt-8">
          <button class="btn btn-outline" @click="prevBlock" :disabled="currentBlock === 0">
            Назад
          </button>
          <button
            class="btn btn-primary"
            @click="nextBlock"
            :disabled="currentBlock === survey.blocks.length - 1 && !answers[currentBlock]"
          >
            {{ currentBlock === survey.blocks.length - 1 ? 'Завершить' : 'Далее' }}
          </button>
        </div>
      </div>

      <!-- Экран завершения -->
      <div v-else class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <div
            class="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-4">Спасибо за участие!</h2>
          <p class="text-base-content/70 mb-6">
            Ваши ответы успешно отправлены. Мы ценим ваше время и обратную связь.
          </p>
          <RouterLink to="/" class="btn btn-primary"> Вернуться на главную </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Анимации для переходов между вопросами */
.card {
  transition: all 0.3s ease-in-out;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 640px) {
  .card-body {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .btn {
    padding: 0.5rem 1rem;
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/useSurveyStore'
import { useResponseStore } from '@/stores/useResponseStore'

const router = useRouter()
const route = useRoute()
const surveyStore = useSurveyStore()
const responseStore = useResponseStore()

// ID опроса из маршрута
const surveyId = route.params.id

// Состояние опроса и ответов
const survey = ref(null)
const answers = ref([])
const currentBlock = ref(0)
const isCompleted = ref(false)
const errorMessage = ref('') // Для отображения ошибок пользователю

// Проверка авторизации и загрузка данных
onMounted(async () => {
  // if (!surveyId) {
  //   router.push('/surveys')
  //   return
  // }

  try {
    console.log(`Загрузка опроса с ID: ${surveyId}`)
    await surveyStore.fetchSurvey(surveyId)
    survey.value = surveyStore.currentSurvey
    console.log('Полученный опрос:', survey.value)

    // Проверяем существование опроса
    if (!survey.value || !survey.value.questions || survey.value.questions.length === 0) {
      throw new Error('Опрос не найден или не содержит вопросов')
    }

    // Проверяем, активен ли опрос
    if (survey.value.active === 0) {
      router.push('/404')
      return
    }

    initializeAnswers()
  } catch (err) {
    console.error('Ошибка при загрузке опроса:', err)
    router.push('/404') // Перенаправляем на 404 вместо /surveys для всех ошибок
  }
})

// Инициализация массива ответов
const initializeAnswers = () => {
  answers.value = survey.value.questions.map((question) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return null
      case 'text':
        return ''
      case 'scale':
        return 5
      default:
        return null
    }
  })
  console.log('Инициализированные ответы:', answers.value)
}

// Переход к следующему вопросу
const nextBlock = () => {
  if (currentBlock.value < survey.value.questions.length - 1) {
    currentBlock.value++
    errorMessage.value = '' // Сбрасываем ошибку при переходе
  } else {
    submitSurvey()
  }
}

// Переход к предыдущему вопросу
const prevBlock = () => {
  if (currentBlock.value > 0) {
    currentBlock.value--
    errorMessage.value = ''
  }
}

// Отправка ответов
const submitSurvey = async () => {
  const responseData = {
    survey_id: Number(surveyId), // Убедимся, что survey_id — число
    text_answers: [],
    choice_answers: [],
    scale_answers: [],
  }

  survey.value.questions.forEach((question, index) => {
    const answer = answers.value[index]
    if (answer !== null && answer !== '') {
      switch (question.question_type) {
        case 'text':
          responseData.text_answers.push({
            question_id: question.id,
            answer,
          })
          break
        case 'multiple_choice':
          const selectedOption = question.answer_options.find((option) => option.title === answer)
          if (selectedOption) {
            responseData.choice_answers.push({
              question_id: question.id,
              answer_option_id: selectedOption.id,
            })
          }
          break
        case 'scale':
          responseData.scale_answers.push({
            question_id: question.id,
            answer: Number(answer),
          })
          break
      }
    }
  })

  // Проверка, есть ли хоть один ответ
  if (
    responseData.text_answers.length === 0 &&
    responseData.choice_answers.length === 0 &&
    responseData.scale_answers.length === 0
  ) {
    errorMessage.value = 'Пожалуйста, ответьте хотя бы на один вопрос перед отправкой.'
    return
  }

  try {
    console.log('Отправка ответов:', responseData)
    await responseStore.submitResponse(responseData)
    isCompleted.value = true
  } catch (err) {
    errorMessage.value = `Ошибка при отправке ответов: ${responseStore.error || 'Неизвестная ошибка'}`
    console.error('Ошибка при отправке:', err)
  }
}

// Вычисляемые свойства для текущего вопроса
const currentQuestion = computed(() => survey.value?.questions[currentBlock.value])
const isLoading = computed(() => surveyStore.loading || responseStore.loading)
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 max-w-3xl py-8">
      <!-- Загрузка -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Ошибка загрузки -->
      <div v-else-if="surveyStore.error" class="alert alert-error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ surveyStore.error }}</span>
      </div>

      <!-- Опрос -->
      <div v-else-if="survey">
        <!-- Заголовок опроса -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-4">{{ survey.title }}</h1>
          <p class="text-base-content/70">{{ survey.description }}</p>
        </div>

        <!-- Прогресс-бар -->
        <div class="mb-8">
          <div class="flex justify-between mb-2">
            <span class="text-sm"
              >Вопрос {{ currentBlock + 1 }} из {{ survey.questions.length }}</span
            >
            <span class="text-sm">
              {{ Math.round(((currentBlock + 1) / survey.questions.length) * 100) }}%
            </span>
          </div>
          <progress
            class="progress progress-primary w-full"
            :value="((currentBlock + 1) / survey.questions.length) * 100"
            max="100"
          ></progress>
        </div>

        <!-- Вопросы -->
        <div v-if="!isCompleted" class="space-y-8">
          <div v-if="currentQuestion" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">{{ currentQuestion.title }}</h2>
              <p v-if="currentQuestion.description" class="text-base-content/70 mb-4">
                {{ currentQuestion.description }}
              </p>

              <!-- Варианты ответов -->
              <div v-if="currentQuestion.question_type === 'multiple_choice'" class="space-y-4">
                <div
                  v-for="option in currentQuestion.answer_options"
                  :key="option.id"
                  class="form-control"
                >
                  <label class="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      :name="'question-' + currentBlock"
                      class="radio radio-primary"
                      v-model="answers[currentBlock]"
                      :value="option.title"
                    />
                    <span class="label-text">{{ option.title }}</span>
                  </label>
                </div>
              </div>

              <!-- Текстовый ответ -->
              <div v-else-if="currentQuestion.question_type === 'text'" class="form-control w-full">
                <textarea
                  v-model="answers[currentBlock]"
                  class="textarea textarea-bordered w-full resize-y min-h-[100px]"
                  placeholder="Введите ваш ответ..."
                ></textarea>
              </div>

              <!-- Шкала оценки -->
              <div v-else-if="currentQuestion.question_type === 'scale'" class="space-y-4">
                <div class="flex justify-between text-sm">
                  <span>1</span>
                  <span>10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  v-model="answers[currentBlock]"
                  class="range range-primary w-full"
                />
                <div class="text-center text-lg font-bold">{{ answers[currentBlock] }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-error">
            Вопрос не найден для текущего индекса: {{ currentBlock }}
          </div>

          <!-- Сообщение об ошибке -->
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Кнопки навигации -->
          <div class="flex justify-between mt-8">
            <button class="btn btn-outline" @click="prevBlock" :disabled="currentBlock === 0">
              Назад
            </button>
            <button
              class="btn btn-primary"
              @click="nextBlock"
              :disabled="
                isLoading ||
                (currentBlock === survey.questions.length - 1 && !answers[currentBlock])
              "
            >
              {{ currentBlock === survey.questions.length - 1 ? 'Завершить' : 'Далее' }}
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
            <router-link to="/" class="btn btn-primary">Вернуться на главную</router-link>
          </div>
        </div>
      </div>

      <!-- Нет данных -->
      <div v-else class="text-center text-error">Опрос не загружен</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.3s ease-in-out;
}

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

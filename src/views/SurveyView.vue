<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/useSurveyStore'
import { useResponseStore } from '@/stores/useResponseStore'

const router = useRouter()
const route = useRoute()
const surveyStore = useSurveyStore()
const responseStore = useResponseStore()

const surveyPublicId = route.params.public_id

const survey = ref(null)
const answers = ref([])
const currentBlock = ref(0)
const isCompleted = ref(false)
const errorMessage = ref('')

const theme = ref(localStorage.getItem('theme') || 'night')

const toggleTheme = () => {
  theme.value = theme.value === 'night' ? 'winter' : 'night'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

onMounted(async () => {
  // Проверяем, что public_id не является числом
  if (!isNaN(Number(surveyPublicId))) {
    router.push('/404') // Если передан числовой id, перенаправляем на 404
    return
  }

  try {
    console.log(`Загрузка опроса с public_id: ${surveyPublicId}`)
    await surveyStore.fetchSurvey(surveyPublicId)
    survey.value = surveyStore.currentSurvey
    console.log('Полученный опрос:', survey.value)

    if (!survey.value || !survey.value.questions || survey.value.questions.length === 0) {
      throw new Error('Опрос не найден или не содержит вопросов')
    }

    if (survey.value.active === 0) {
      router.push('/404')
      return
    }

    await responseStore.fetchResponses(survey.value.id)
    const responseCount = responseStore.responses.filter(
      (resp) => resp.survey_id === survey.value.id,
    ).length
    console.log('Количество ответов:', responseCount)

    if (survey.value.response_limit && responseCount >= survey.value.response_limit) {
      router.push('/404')
      return
    }

    initializeAnswers()
  } catch (err) {
    console.error('Ошибка при загрузке опроса:', err)
    router.push('/404')
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
    errorMessage.value = ''
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
    survey_id: survey.value.id, // Используем числовой id из данных опроса
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
  <div class="min-h-screen bg-base-200 relative flex items-center justify-center">
    <!-- Верхняя панель с логотипом и переключателем тем -->
    <div
      class="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-4 z-10 mt-2"
    >
      <!-- Пустое место слева для симметрии -->
      <div class="w-20"></div>

      <!-- Логотип в центре -->
      <RouterLink
        to="/"
        class="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"
      >
        <img
          src="../assets/img/logo-polytech.svg"
          alt="Polytech Forms"
          class="w-8 inline-block align-middle logo"
        />
        <span class="text-2xl font-bold text-white hidden sm:inline-block align-middle logo"
          >Forms</span
        >
      </RouterLink>

      <!-- Переключатель темы справа -->
      <div class="flex items-center">
        <label class="swap swap-rotate">
          <input
            type="checkbox"
            class="theme-controller"
            :checked="theme === 'winter'"
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
      </div>
    </div>

    <!-- Основной контент -->
    <div class="container mx-auto px-4 max-w-3xl py-8 mt-16">
      <!-- Загрузка -->
      <div v-if="isLoading" class="min-h-[60vh] flex flex-col items-center justify-center">
        <div class="relative">
          <div
            class="w-16 h-16 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"
          >
            <div
              class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-[spin_1.5s_ease-in-out_infinite]"
            ></div>
          </div>
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite]">
            <div class="w-16 h-16 rounded-full bg-primary/10"></div>
          </div>
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite_0.5s]">
            <div class="w-16 h-16 rounded-full bg-primary/5"></div>
          </div>
        </div>
        <div class="mt-8 text-lg font-medium text-base-content/70">
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite]">З</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.1s]">а</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.2s]">г</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.3s]">р</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.4s]">у</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.5s]">з</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.6s]">к</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.7s]">а</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.8s]">.</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.9s]">.</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_1s]">.</span>
        </div>
        <p class="mt-2 text-sm text-base-content/50">Пожалуйста, подождите</p>
      </div>

      <!-- Опрос -->
      <div v-else-if="survey">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-4">{{ survey.title }}</h1>
          <p class="text-base-content/70">{{ survey.description }}</p>
        </div>

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

        <div v-if="!isCompleted" class="space-y-8">
          <div v-if="currentQuestion" class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">{{ currentQuestion.title }}</h2>
              <p v-if="currentQuestion.description" class="text-base-content/70 mb-4">
                {{ currentQuestion.description }}
              </p>

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

              <div v-else-if="currentQuestion.question_type === 'text'" class="form-control w-full">
                <textarea
                  v-model="answers[currentBlock]"
                  class="textarea textarea-bordered w-full resize-y min-h-[100px]"
                  placeholder="Введите ваш ответ..."
                ></textarea>
              </div>

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

          <div v-if="errorMessage" class="alert alert-error mt-4">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

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

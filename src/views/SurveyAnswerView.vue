<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/useSurveyStore'
import { useResponseStore } from '@/stores/useResponseStore'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const surveyStore = useSurveyStore()
const responseStore = useResponseStore()
const authStore = useAuthStore()

// Public ID опроса из маршрута
const surveyPublicId = route.params.public_id

// Числовой ID опроса (будет установлен после загрузки данных)
const surveyNumericId = ref(null)

// Состояние опроса
const survey = ref(null)
const activeTab = ref('general')
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 1

// Загрузка данных
onMounted(async () => {
  if (!authStore.authData?.token) {
    router.push('/login')
    return
  }

  if (!surveyPublicId) {
    router.push('/surveys')
    return
  }

  await fetchSurveyData()
})

const fetchSurveyData = async () => {
  try {
    isLoading.value = true
    await surveyStore.fetchSurvey(surveyPublicId) // Загружаем по public_id
    await responseStore.fetchResponses()
    survey.value = surveyStore.currentSurvey

    if (!survey.value) {
      throw new Error('Опрос не найден')
    }

    // Устанавливаем числовой ID из загруженных данных
    surveyNumericId.value = survey.value.id

    // Дополняем данные статистикой ответов
    survey.value.responses = responseStore.responses.filter(
      (r) => r.survey_id === surveyNumericId.value,
    ).length
    survey.value.individualResponses = responseStore.responses
      .filter((r) => r.survey_id === surveyNumericId.value)
      .map((response) => ({
        id: response.id,
        date: response.created_at,
        answers: {
          ...response.text_answers.reduce((acc, a) => ({ ...acc, [a.question_id]: a.answer }), {}),
          ...response.choice_answers.reduce(
            (acc, a) => ({
              ...acc,
              [a.question_id]: survey.value.questions
                .find((q) => q.id === a.question_id)
                ?.answer_options.find((o) => o.id === a.answer_option_id)?.title,
            }),
            {},
          ),
          ...response.scale_answers.reduce((acc, a) => ({ ...acc, [a.question_id]: a.answer }), {}),
        },
      }))

    // Формируем статистику для вопросов
    survey.value.questions.forEach((question) => {
      if (question.question_type === 'multiple_choice') {
        question.answers = question.answer_options.reduce((acc, option) => {
          acc[option.title] = responseStore.responses
            .filter((r) => r.survey_id === surveyNumericId.value)
            .flatMap((r) => r.choice_answers)
            .filter((a) => a.question_id === question.id && a.answer_option_id === option.id).length
          return acc
        }, {})
      } else if (question.question_type === 'scale') {
        const scaleAnswers = responseStore.responses
          .filter((r) => r.survey_id === surveyNumericId.value)
          .flatMap((r) => r.scale_answers)
          .filter((a) => a.question_id === question.id)
        question.answers = {
          average: scaleAnswers.length
            ? (scaleAnswers.reduce((sum, a) => sum + a.answer, 0) / scaleAnswers.length).toFixed(1)
            : 0,
          distribution: Array.from({ length: 10 }, (_, i) => i + 1).reduce((acc, rating) => {
            acc[rating] = scaleAnswers.filter((a) => a.answer === rating).length
            return acc
          }, {}),
        }
      } else if (question.question_type === 'text') {
        question.answers = responseStore.responses
          .filter((r) => r.survey_id === surveyNumericId.value)
          .flatMap((r) => r.text_answers)
          .filter((a) => a.question_id === question.id)
          .map((a) => a.answer)
      }
    })
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err)
    router.push('/surveys')
  } finally {
    isLoading.value = false
  }
}

// Пагинация
const totalPages = computed(() =>
  Math.ceil(survey.value?.individualResponses.length / itemsPerPage),
)
const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return survey.value?.individualResponses.slice(start, end) || []
})

// URL опроса с использованием public_id
const surveyUrl = computed(() => {
  return `${window.location.origin}/survey/${survey.value?.public_id}`
})

// Функции
const toggleStatus = () => {
  showStatusModal.value = true
}

const confirmStatusChange = async () => {
  try {
    const newActive = survey.value.active === 1 ? 0 : 1
    const surveyData = { active: newActive }
    console.log('Данные для updateSurvey:', JSON.stringify(surveyData, null, 2))
    await surveyStore.updateSurvey(surveyNumericId.value, surveyData) // Обновляем по числовому id
    survey.value.active = newActive
    showStatusModal.value = false
  } catch (err) {
    console.error('Ошибка при изменении статуса:', err.response?.data || err)
  }
}

const refreshData = async () => {
  await fetchSurveyData()
}

const copyLink = () => {
  navigator.clipboard.writeText(surveyUrl.value)
}

const deleteSurvey = async () => {
  try {
    await surveyStore.deleteSurvey(surveyNumericId.value) // Удаляем по числовому id
    showDeleteModal.value = false
    router.push('/surveys')
  } catch (err) {
    console.error('Ошибка при удалении опроса:', err)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="max-w-5xl mx-auto">
      <!-- Загрузка -->
      <div v-if="isLoading" class="min-h-[60vh] flex flex-col items-center justify-center">
        <div class="relative">
          <!-- Основной спиннер -->
          <div
            class="w-16 h-16 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"
          >
            <div
              class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-[spin_1.5s_ease-in-out_infinite]"
            ></div>
          </div>

          <!-- Пульсирующие круги -->
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite]">
            <div class="w-16 h-16 rounded-full bg-primary/10"></div>
          </div>
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite_0.5s]">
            <div class="w-16 h-16 rounded-full bg-primary/5"></div>
          </div>
        </div>

        <!-- Текст загрузки с анимацией -->
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

        <!-- Дополнительный текст -->
        <p class="mt-2 text-sm text-base-content/50">Пожалуйста, подождите</p>
      </div>

      <!-- Контент -->
      <div v-else-if="survey">
        <!-- Заголовок и действия -->
        <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div class="flex-1">
            <div class="flex items-start gap-4 mb-4">
              <h1 class="text-3xl font-bold max-w-screen-sm">{{ survey.title }}</h1>
              <div
                class="badge badge-lg mt-1"
                :class="{
                  'badge-primary': survey.active === 1,
                  'badge-neutral': survey.active === 0,
                }"
              >
                {{ survey.active === 1 ? 'Активный' : 'Завершен' }}
              </div>
            </div>
            <p class="text-base-content/70 text-lg mb-4">{{ survey.description }}</p>
            <div class="flex flex-wrap gap-4 items-center text-sm">
              <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <i class="fa-regular fa-calendar-check text-primary"></i>
                <span>{{ survey.practice?.title }} - {{ survey.group?.title }}</span>
              </div>
              <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <i class="fa-regular fa-calendar text-primary"></i>
                Создан: {{ new Date(survey.created_at).toLocaleDateString() }}
              </div>
              <!-- Лимит ответов с иконкой fa-regular fa-lock -->
              <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <i class="fa-solid fa-shield-halved text-primary"></i> Лимит:
                {{ survey.response_limit || 'Не ограничен' }}
              </div>
              <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <i class="fa-regular fa-message text-primary"></i>
                {{ survey.responses }} ответов
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button class="btn btn-outline" @click="refreshData" :disabled="isLoading">
              <i class="fa-solid fa-rotate mr-2"></i>
              Обновить
            </button>
            <RouterLink :to="'/survey/edit/' + survey.public_id" class="btn btn-primary">
              <i class="fa-solid fa-pen-to-square mr-2"></i>
              Изменить
            </RouterLink>
            <button class="btn btn-primary" @click="showShareModal = true">
              <i class="fa-solid fa-share-nodes mr-2"></i>
              Поделиться
            </button>
            <button class="btn btn-error" @click="showDeleteModal = true">
              <i class="fa-regular fa-trash-can mr-2"></i>
              Удалить
            </button>
          </div>
        </div>

        <!-- Переключатель статуса -->
        <div class="flex items-center justify-center gap-4 mb-8 bg-base-200 p-4 rounded-lg">
          <span class="text-lg font-medium">Статус опроса:</span>
          <div class="form-control">
            <label class="label cursor-pointer gap-4">
              <span class="label-text text-lg">Завершён</span>
              <input
                type="checkbox"
                class="toggle toggle-lg"
                :checked="survey?.active === 1"
                @change="toggleStatus"
              />
              <span class="label-text text-lg">Активный</span>
            </label>
          </div>
        </div>

        <!-- Вкладки -->
        <div class="flex justify-center mb-8">
          <div class="tabs tabs-boxed bg-base-200 p-1 rounded-full">
            <a
              class="tab tab-lg min-w-[200px] rounded-full"
              :class="{ 'tab-active': activeTab === 'general' }"
              @click="activeTab = 'general'"
            >
              <i class="fa-solid fa-chart-pie mr-2"></i>
              Общая статистика
            </a>
            <a
              class="tab tab-lg min-w-[200px] rounded-full"
              :class="{ 'tab-active': activeTab === 'individual' }"
              @click="activeTab = 'individual'"
            >
              <i class="fa-solid fa-list-check mr-2"></i>
              Индивидуальные ответы
            </a>
          </div>
        </div>

        <!-- Общая статистика -->
        <div v-if="activeTab === 'general'" class="space-y-8">
          <div
            v-for="question in survey.questions"
            :key="question.id"
            class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div class="card-body">
              <h3 class="card-title text-xl">{{ question.title }}</h3>
              <p class="text-base-content/70 mb-4">{{ question.description }}</p>

              <!-- Множественный выбор -->
              <div v-if="question.question_type === 'multiple_choice'" class="space-y-6">
                <div
                  v-for="(count, option) in question.answers"
                  :key="option"
                  class="flex items-center gap-4"
                >
                  <div class="w-32 font-medium">{{ option }}</div>
                  <div class="flex-1">
                    <div class="w-full bg-base-200 rounded-full h-3">
                      <div
                        class="bg-primary h-3 rounded-full transition-all duration-500"
                        :style="{ width: `${(count / survey.responses) * 100 || 0}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="w-16 text-right font-medium">{{ count }}</div>
                </div>
              </div>

              <!-- Шкала оценок -->
              <div v-if="question.question_type === 'scale'" class="space-y-6">
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary mb-2">
                    {{ question.answers.average }}
                  </div>
                  <div class="text-base-content/70">Средняя оценка</div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-end gap-1 h-40 bg-base-200 p-4 rounded-lg">
                    <div
                      v-for="(count, rating) in question.answers.distribution"
                      :key="rating"
                      class="flex-1 bg-primary/20 rounded-t transition-all duration-500 hover:bg-primary/30 relative"
                      :style="{ height: `${(count / survey.responses) * 100 || 0}%` }"
                    >
                      <div class="text-center text-sm mt-1 font-medium absolute bottom-1 w-full">
                        {{ count }}
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-1 px-4">
                    <div
                      v-for="(count, rating) in question.answers.distribution"
                      :key="rating"
                      class="flex-1 text-center text-sm font-medium text-base-content/70"
                    >
                      {{ rating }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Текстовые ответы -->
              <div v-if="question.question_type === 'text'" class="space-y-4">
                <div
                  v-for="(answer, index) in question.answers"
                  :key="index"
                  class="p-4 bg-base-200 rounded-lg"
                >
                  {{ answer }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Индивидуальные ответы -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between mb-6 bg-base-200 p-4 rounded-lg">
            <div class="flex items-center gap-4">
              <span class="text-lg font-medium">Ответы</span>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  :value="currentPage"
                  @change="goToPage($event.target.value)"
                  class="input input-bordered w-12 text-center text-lg font-bold"
                  :max="totalPages"
                  min="1"
                  step="1"
                />
                <span class="text-base-content/70">из</span>
                <span class="text-2xl font-bold text-primary">{{ totalPages }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="btn btn-circle btn-outline"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                class="btn btn-circle btn-outline"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div
            v-for="response in paginatedResponses"
            :key="response.id"
            class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div class="card-body">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-2 text-base-content/60">
                  <i class="fa-regular fa-clock"></i>
                  {{ new Date(response.date).toLocaleString() }}
                </div>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(answer, questionId) in response.answers"
                  :key="questionId"
                  class="flex flex-col gap-2 p-4 bg-base-200 rounded-lg"
                >
                  <div class="font-medium text-base-content/70">
                    {{ survey.questions.find((q) => q.id === parseInt(questionId))?.title }}
                  </div>
                  <p class="text-base-content/70 mb-2">
                    {{ survey.questions.find((q) => q.id === parseInt(questionId))?.description }}
                  </p>
                  <div class="text-lg font-semibold">{{ answer }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Модальные окна -->
        <dialog class="modal" :class="{ 'modal-open': showShareModal }">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Поделиться опросом</h3>
            <div class="flex gap-2">
              <input type="text" :value="surveyUrl" class="input input-bordered flex-1" readonly />
              <button class="btn btn-primary" @click="copyLink">
                <i class="fa-regular fa-copy"></i>
              </button>
            </div>
            <div class="modal-action">
              <button class="btn" @click="showShareModal = false">Закрыть</button>
            </div>
          </div>
        </dialog>

        <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Удаление опроса</h3>
            <p class="mb-4">
              Вы уверены, что хотите удалить опрос "{{ survey.title }}"? Это действие нельзя
              отменить.
            </p>
            <div class="modal-action">
              <button class="btn" @click="showDeleteModal = false">Отмена</button>
              <button class="btn btn-error" @click="deleteSurvey">Удалить</button>
            </div>
          </div>
        </dialog>

        <!-- Модальное окно изменения статуса -->
        <dialog class="modal" :class="{ 'modal-open': showStatusModal }">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Изменение статуса опроса</h3>
            <p class="mb-4">
              Вы уверены, что хотите изменить статус опроса на "{{
                survey?.active === 1 ? 'Завершён' : 'Активный'
              }}"?
            </p>
            <div class="modal-action">
              <button class="btn" @click="showStatusModal = false">Отмена</button>
              <button class="btn btn-primary" @click="confirmStatusChange">Подтвердить</button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.tab {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  background-color: rgba(var(--color-primary), 0.1);
}

.tab-active {
  background-color: var(--color-primary);
  color: white;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.btn-circle {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input[type='number'] {
  -moz-appearance: textfield;
}

.input[type='number']::-webkit-outer-spin-button,
.input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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

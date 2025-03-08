<script setup>
import { ref, computed } from 'vue'

// Имитация данных опроса
const survey = ref({
  id: 1,
  title: 'Оценка качества преподавания',
  description: 'Опрос по оценке качества преподавания в текущем семестре',
  createdAt: '2024-03-15',
  responses: 45,
  status: 'active',
  schedule: 'Производственная практика - ИС-21',
  questions: [
    {
      id: 1,
      type: 'Множественный выбор',
      question: 'Как вы оцениваете качество преподавания?',
      options: ['Отлично', 'Хорошо', 'Удовлетворительно', 'Плохо'],
      answers: {
        Отлично: 20,
        Хорошо: 15,
        Удовлетворительно: 7,
        Плохо: 3,
      },
    },
    {
      id: 2,
      type: 'Шкала оценок',
      question: 'Оцените доступность объяснения материала',
      scale: { min: 1, max: 10 },
      answers: {
        average: 8.5,
        distribution: {
          1: 0,
          2: 0,
          3: 1,
          4: 2,
          5: 3,
          6: 5,
          7: 8,
          8: 12,
          9: 10,
          10: 4,
        },
      },
    },
  ],
  individualResponses: [
    {
      id: 1,
      date: '2024-03-15 14:30',
      answers: {
        1: 'Отлично',
        2: 9,
      },
    },
    {
      id: 2,
      date: '2024-03-15 15:45',
      answers: {
        1: 'Хорошо',
        2: 8,
      },
    },
    {
      id: 3,
      date: '2024-03-15 16:20',
      answers: {
        1: 'Отлично',
        2: 10,
      },
    },
  ],
})

const activeTab = ref('general')
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 1

// Вычисляемые свойства для пагинации
const totalPages = computed(() => Math.ceil(survey.value.individualResponses.length / itemsPerPage))
const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return survey.value.individualResponses.slice(start, end)
})

// Вычисляемое свойство для URL опроса
const surveyUrl = computed(() => {
  return `${window.location.origin}/survey/${survey.value.id}`
})

// Функции
const toggleStatus = () => {
  showStatusModal.value = true
}

const confirmStatusChange = () => {
  survey.value.status = survey.value.status === 'active' ? 'completed' : 'active'
  showStatusModal.value = false
}

const refreshData = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  isLoading.value = false
}

const copyLink = () => {
  navigator.clipboard.writeText(surveyUrl.value)
}

const deleteSurvey = () => {
  showDeleteModal.value = false
}

// Функции для пагинации
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
      <!-- Заголовок и основные действия -->
      <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div class="flex-1">
          <div class="flex items-center gap-4 mb-4">
            <h1 class="text-3xl font-bold">{{ survey.title }}</h1>
            <div
              class="badge badge-lg"
              :class="{
                'badge-primary': survey.status === 'active',
                'badge-neutral': survey.status === 'completed',
              }"
            >
              {{ survey.status === 'active' ? 'Активный' : 'Завершен' }}
            </div>
          </div>
          <p class="text-base-content/70 text-lg mb-4">{{ survey.description }}</p>
          <div class="flex flex-wrap gap-4 items-center text-sm">
            <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
              <i class="fa-solid fa-calendar-check text-primary"></i>
              <span>{{ survey.schedule }}</span>
            </div>
            <div class="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
              <i class="fa-regular fa-calendar text-primary"></i>
              Создан: {{ survey.createdAt }}
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
          <RouterLink :to="'/surveys/' + survey.id + '/edit'" class="btn btn-primary">
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
            <span class="label-text text-lg">Завершен</span>
            <input
              type="checkbox"
              class="toggle toggle-lg"
              :checked="survey.status === 'active'"
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

      <!-- Содержимое вкладок -->
      <div v-if="activeTab === 'general'" class="space-y-8">
        <!-- Общая статистика -->
        <div
          v-for="question in survey.questions"
          :key="question.id"
          class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div class="card-body">
            <h3 class="card-title text-xl mb-6">{{ question.question }}</h3>

            <!-- Статистика для множественного выбора -->
            <div v-if="question.type === 'Множественный выбор'" class="space-y-6">
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
                      :style="{ width: `${(count / survey.responses) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <div class="w-16 text-right font-medium">{{ count }}</div>
              </div>
            </div>

            <!-- Статистика для шкалы оценок -->
            <div v-if="question.type === 'Шкала оценок'" class="space-y-6">
              <div class="text-center">
                <div class="text-4xl font-bold text-primary mb-2">
                  {{ question.answers.average }}
                </div>
                <div class="text-base-content/70">Средняя оценка</div>
              </div>
              <div class="flex items-end gap-1 h-40 bg-base-200 p-4 rounded-lg">
                <div
                  v-for="(count, rating) in question.answers.distribution"
                  :key="rating"
                  class="flex-1 bg-primary/20 rounded-t transition-all duration-500 hover:bg-primary/30"
                  :style="{ height: `${(count / survey.responses) * 100}%` }"
                >
                  <div class="text-center text-sm mt-1 font-medium">{{ count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <!-- Пагинация -->
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

        <!-- Индивидуальные ответы -->
        <div
          v-for="response in paginatedResponses"
          :key="response.id"
          class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <div class="card-body">
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-2 text-base-content/60">
                <i class="fa-regular fa-clock"></i>
                {{ response.date }}
              </div>
            </div>
            <div class="space-y-4">
              <div
                v-for="(answer, questionId) in response.answers"
                :key="questionId"
                class="flex flex-col gap-2 p-4 bg-base-200 rounded-lg"
              >
                <div class="font-medium text-base-content/70">
                  {{ survey.questions.find((q) => q.id === parseInt(questionId))?.question }}
                </div>
                <div class="text-lg font-semibold">{{ answer }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для шаринга -->
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

    <!-- Модальное окно удаления -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Удаление опроса</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить опрос "{{ survey.title }}"? Это действие нельзя отменить.
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
            survey.status === 'active' ? 'Завершен' : 'Активный'
          }}"?
        </p>
        <div class="modal-action">
          <button class="btn" @click="showStatusModal = false">Отмена</button>
          <button class="btn btn-primary" @click="confirmStatusChange">Подтвердить</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
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
</style>

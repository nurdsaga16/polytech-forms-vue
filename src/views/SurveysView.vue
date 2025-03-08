<script setup>
import { ref } from 'vue'

// Имитация данных опросов
const surveys = ref([
  {
    id: 1,
    title: 'Оценка качества преподавания',
    description: 'Опрос по оценке качества преподавания в текущем семестре',
    createdAt: '37 минут назад',
    responses: 12,
    status: 'active',
    schedule: 'Производственная практика - ИС-21',
  },
  {
    id: 2,
    title: 'Удовлетворенность учебным процессом',
    description: 'Опрос по оценке удовлетворенности учебным процессом',
    createdAt: '2 месяца назад',
    responses: 45,
    status: 'completed',
    schedule: 'Учебная практика - ИС-22',
  },
  {
    id: 3,
    title: 'Оценка лабораторных работ',
    description: 'Опрос по оценке качества проведения лабораторных работ',
    createdAt: '1 неделя назад',
    responses: 8,
    status: 'active',
    schedule: 'Преддипломная практика - ИС-23',
  },
])

const showDeleteModal = ref(false)
const selectedSurvey = ref(null)

const openDeleteModal = (survey) => {
  selectedSurvey.value = survey
  showDeleteModal.value = true
}

const copyLink = (survey) => {
  // Здесь будет логика копирования ссылки
  console.log('Копирование ссылки для опроса:', survey.id)
}
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="max-w-5xl mx-auto">
      <!-- Заголовок и кнопка создания -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-clipboard-list text-xl"></i>
          </div>
          <h1 class="text-2xl font-bold">Мои опросы</h1>
        </div>
        <RouterLink to="/survey/create" class="btn btn-primary">
          <i class="fa-solid fa-plus mr-2"></i>
          Создать опрос
        </RouterLink>
      </div>

      <!-- Список опросов -->
      <div class="grid gap-4">
        <div v-if="surveys.length === 0" class="text-center py-12 text-base-content/50">
          <i class="fa-solid fa-clipboard-list text-3xl mb-3"></i>
          <p class="text-lg">У вас пока нет опросов</p>
          <p class="text-sm mt-2">Создайте новый опрос, чтобы начать</p>
        </div>
        <div v-else v-for="survey in surveys" :key="survey.id" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <!-- Информация об опросе -->
              <div class="flex-1">
                <h2 class="card-title text-xl mb-2">{{ survey.title }}</h2>
                <p class="text-base-content/70 mb-2">{{ survey.description }}</p>
                <div class="flex items-center gap-2 text-sm text-base-content/60 mb-2">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span>{{ survey.schedule }}</span>
                </div>
                <div class="flex flex-wrap gap-4 text-sm text-base-content/60">
                  <div class="flex items-center gap-2">
                    <i class="fa-regular fa-clock"></i>
                    {{ survey.createdAt }}
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-regular fa-message"></i>
                    {{ survey.responses }} ответов
                  </div>
                  <div class="flex items-center gap-2">
                    <div
                      class="badge"
                      :class="{
                        'badge-primary': survey.status === 'active',
                        'badge-neutral': survey.status === 'completed',
                      }"
                    >
                      {{ survey.status === 'active' ? 'Активный' : 'Завершен' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Кнопки действий -->
              <div class="flex flex-wrap gap-2">
                <RouterLink :to="'/survey/' + survey.id" class="btn btn-outline">
                  <i class="fa-solid fa-eye mr-2"></i>
                  Просмотр
                </RouterLink>
                <button class="btn btn-primary" @click="copyLink(survey)">
                  <i class="fa-solid fa-share-nodes mr-2"></i>
                  Поделиться
                </button>
                <button class="btn btn-error" @click="openDeleteModal(survey)">
                  <i class="fa-regular fa-trash-can mr-2"></i>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно удаления -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Удаление опроса</h3>
        <p class="mb-4">
          Вы уверены, что хотите удалить опрос "{{ selectedSurvey?.title }}"? Это действие нельзя
          отменить.
        </p>
        <div class="modal-action">
          <button class="btn" @click="showDeleteModal = false">Отмена</button>
          <button class="btn btn-error" @click="showDeleteModal = false">Удалить</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
}
</style>

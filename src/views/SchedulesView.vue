<script setup>
import { ref, computed } from 'vue'

// Состояние для текущего месяца
const currentDate = ref(new Date())

// Заглушка для графиков
const schedules = ref([
  {
    id: 1,
    practice: 'Производственная практика',
    teacher: 'Иванов И.И.',
    group: 'ИС-21',
    startDate: '2025-03-01',
    endDate: '2025-03-15',
  },
  {
    id: 2,
    practice: 'Учебная практика',
    teacher: 'Петров П.П.',
    group: 'ИС-22',
    startDate: '2025-02-10',
    endDate: '2025-02-25',
  },
])

// Функции для работы с календарем
function getDaysInMonth(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  // Добавляем пустые дни в начало
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }

  // Добавляем дни месяца
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

function isDateInRange(date, startDate, endDate) {
  const current = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Устанавливаем время в начало дня для корректного сравнения
  current.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  return current >= start && current <= end
}

function getScheduleForDate(date) {
  return schedules.value.filter((schedule) =>
    isDateInRange(date, schedule.startDate, schedule.endDate),
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function changeMonth(delta) {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

function getMonthName(date) {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

// Функция для определения статуса графика
function isScheduleCompleted(schedule) {
  const today = new Date()
  const endDate = new Date(schedule.endDate)
  return endDate < today
}

// Получение активных графиков
const activeSchedules = computed(() =>
  schedules.value.filter((schedule) => !isScheduleCompleted(schedule)),
)

// Получение завершенных графиков
const completedSchedules = computed(() =>
  schedules.value.filter((schedule) => isScheduleCompleted(schedule)),
)

const showDeleteModal = ref(false)
const selectedSchedule = ref(null)

const openDeleteModal = (schedule) => {
  selectedSchedule.value = schedule
  showDeleteModal.value = true
}

const deleteSchedule = () => {
  schedules.value = schedules.value.filter((s) => s.id !== selectedSchedule.value.id)
  showDeleteModal.value = false
  selectedSchedule.value = null
}
</script>

<template>
  <div class="schedule-view py-4 sm:py-8">
    <div class="mx-auto max-w-4xl px-2 sm:px-4">
      <!-- Заголовок -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-calendar text-lg sm:text-xl"></i>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold">Графики практик</h1>
        </div>
        <RouterLink to="/schedule/create" class="btn btn-primary btn-sm sm:btn-md gap-2">
          <i class="fa-solid fa-plus"></i>
          Создать график
        </RouterLink>
      </div>

      <!-- Список графиков -->
      <div class="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        <!-- Активные графики -->
        <div>
          <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Активные графики</h3>
          <div class="space-y-3 sm:space-y-4">
            <div
              v-if="activeSchedules.length === 0"
              class="text-center py-6 sm:py-8 text-base-content/50"
            >
              <i class="fa-solid fa-calendar-check text-xl sm:text-2xl mb-2"></i>
              <p class="text-sm sm:text-base">Нет активных графиков</p>
            </div>
            <div
              v-else
              v-for="schedule in activeSchedules"
              :key="schedule.id"
              class="card bg-base-100 shadow hover:shadow-md transition-shadow"
            >
              <div class="card-body p-3 sm:p-6">
                <div class="flex flex-col gap-2">
                  <div>
                    <h4 class="text-base sm:text-lg font-medium">{{ schedule.practice }}</h4>
                    <p class="text-sm sm:text-base text-base-content/70">{{ schedule.group }}</p>
                    <p class="text-xs sm:text-sm text-base-content/50">{{ schedule.teacher }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div class="badge badge-primary text-xs sm:text-sm w-fit">
                      {{ formatDate(schedule.startDate) }} - {{ formatDate(schedule.endDate) }}
                    </div>
                    <div class="flex gap-2 ml-auto">
                      <RouterLink
                        :to="`/schedule/${schedule.id}/edit`"
                        class="btn btn-ghost btn-xs sm:btn-sm"
                      >
                        <i class="fa-solid fa-pen-to-square"></i>
                      </RouterLink>
                      <button
                        class="btn btn-ghost btn-xs sm:btn-sm text-error"
                        @click="openDeleteModal(schedule)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Завершенные графики -->
        <div>
          <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Завершенные графики</h3>
          <div class="space-y-3 sm:space-y-4">
            <div
              v-if="completedSchedules.length === 0"
              class="text-center py-6 sm:py-8 text-base-content/50"
            >
              <i class="fa-solid fa-calendar-xmark text-xl sm:text-2xl mb-2"></i>
              <p class="text-sm sm:text-base">Нет завершенных графиков</p>
            </div>
            <div
              v-else
              v-for="schedule in completedSchedules"
              :key="schedule.id"
              class="card bg-base-100 shadow hover:shadow-md transition-shadow opacity-75"
            >
              <div class="card-body p-3 sm:p-6">
                <div class="flex flex-col gap-2">
                  <div>
                    <h4 class="text-base sm:text-lg font-medium">{{ schedule.practice }}</h4>
                    <p class="text-sm sm:text-base text-base-content/70">{{ schedule.group }}</p>
                    <p class="text-xs sm:text-sm text-base-content/50">{{ schedule.teacher }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div class="badge badge-ghost text-xs sm:text-sm w-fit">
                      {{ formatDate(schedule.startDate) }} - {{ formatDate(schedule.endDate) }}
                    </div>
                    <div class="flex gap-2 ml-auto">
                      <RouterLink
                        :to="`/schedule/${schedule.id}/edit`"
                        class="btn btn-ghost btn-xs sm:btn-sm"
                      >
                        <i class="fa-solid fa-pen-to-square"></i>
                      </RouterLink>
                      <button
                        class="btn btn-ghost btn-xs sm:btn-sm text-error"
                        @click="openDeleteModal(schedule)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно удаления -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box max-w-sm sm:max-w-md overflow-x-hidden">
        <h3 class="font-bold text-base sm:text-lg mb-4">Удаление графика</h3>
        <p class="text-sm sm:text-base mb-4">
          Вы уверены, что хотите удалить график практики "{{ selectedSchedule?.practice }}" для
          группы "{{ selectedSchedule?.group }}"?
        </p>
        <div class="modal-action">
          <button class="btn btn-sm sm:btn-md" @click="showDeleteModal = false">Отмена</button>
          <button class="btn btn-error btn-sm sm:btn-md" @click="deleteSchedule">Удалить</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.schedule-view {
  min-height: calc(100vh - 64px - 88px);
}
</style>

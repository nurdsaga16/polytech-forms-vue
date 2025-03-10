<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/useScheduleStore'

const router = useRouter()
const scheduleStore = useScheduleStore()

const showDeleteModal = ref(false)
const selectedSchedule = ref(null)
const currentDate = ref(new Date())

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Функции для работы с календарем
const getMonthName = (date) => {
  return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
}

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  // Добавляем пустые ячейки для выравнивания по понедельнику
  let firstDayOfWeek = firstDay.getDay() || 7 // Преобразуем воскресенье (0) в 7
  for (let i = 1; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Добавляем дни месяца
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

const getScheduleForDate = (date) => {
  return scheduleStore.schedules
    .filter((schedule) => {
      const scheduleStart = new Date(schedule.start_date)
      const scheduleEnd = new Date(schedule.end_date)
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

      // Устанавливаем время в 00:00:00 для корректного сравнения
      scheduleStart.setHours(0, 0, 0, 0)
      scheduleEnd.setHours(0, 0, 0, 0)

      return currentDate >= scheduleStart && currentDate <= scheduleEnd
    })
    .map((schedule) => ({
      id: schedule.id,
      practice: schedule.practice.title,
      group: schedule.group.title,
      teacher: schedule.user?.full_name || 'Не указан',
      startDate: schedule.start_date,
      endDate: schedule.end_date,
    }))
}

const isScheduleCompleted = (schedule) => {
  const endDate = new Date(schedule.endDate)
  return endDate < new Date()
}

// Разделение графиков на активные и завершенные
const activeSchedules = computed(() => {
  return scheduleStore.schedules
    .filter((schedule) => {
      const endDate = new Date(schedule.end_date)
      return endDate >= new Date()
    })
    .map((schedule) => ({
      id: schedule.id,
      practice: schedule.practice.title,
      group: schedule.group.title,
      teacher: schedule.user?.full_name || 'Не указан',
      startDate: schedule.start_date,
      endDate: schedule.end_date,
    }))
})

const completedSchedules = computed(() => {
  return scheduleStore.schedules
    .filter((schedule) => {
      const endDate = new Date(schedule.end_date)
      return endDate < new Date()
    })
    .map((schedule) => ({
      id: schedule.id,
      practice: schedule.practice.title,
      group: schedule.group.title,
      teacher: schedule.user?.full_name || 'Не указан',
      startDate: schedule.start_date,
      endDate: schedule.end_date,
    }))
})

onMounted(() => {
  scheduleStore.fetchSchedules()
})

const openDeleteModal = (schedule) => {
  selectedSchedule.value = schedule
  showDeleteModal.value = true
}

const deleteSchedule = async () => {
  if (selectedSchedule.value) {
    try {
      await scheduleStore.deleteSchedule(selectedSchedule.value.id)
      showDeleteModal.value = false
      selectedSchedule.value = null
    } catch (error) {
      console.error('Ошибка при удалении:', error)
    }
  }
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

      <!-- Загрузка -->
      <div
        v-if="scheduleStore.loading"
        class="min-h-[60vh] flex flex-col items-center justify-center"
      >
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

      <!-- Ошибка -->
      <div v-else-if="scheduleStore.error" class="alert alert-error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ scheduleStore.error }}</span>
      </div>

      <!-- Список графиков -->
      <div v-else class="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        <!-- Календарь -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body p-2 sm:p-6">
            <!-- Навигация по месяцам -->
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <button class="btn btn-ghost btn-xs sm:btn-sm" @click="changeMonth(-1)">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <h2 class="text-base sm:text-lg font-semibold">{{ getMonthName(currentDate) }}</h2>
              <button class="btn btn-ghost btn-xs sm:btn-sm" @click="changeMonth(1)">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <!-- Дни недели -->
            <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
              <div
                v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']"
                :key="day"
                class="text-center text-xs sm:text-sm font-medium text-base-content/70"
              >
                {{ day }}
              </div>
            </div>

            <!-- Календарная сетка -->
            <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
              <div
                v-for="(day, index) in getDaysInMonth(currentDate)"
                :key="index"
                class="aspect-square p-0.5 sm:p-1 border rounded-lg text-[10px] sm:text-xs"
                :class="{
                  'bg-base-200': !day,
                  'hover:bg-base-200': day,
                }"
              >
                <template v-if="day">
                  <div class="font-medium mb-0.5">{{ day.getDate() }}</div>
                  <div class="space-y-0.5">
                    <div
                      v-for="schedule in getScheduleForDate(day)"
                      :key="schedule.id"
                      class="p-0.5 rounded cursor-pointer transition-colors"
                      :class="{
                        'bg-primary/10 text-primary hover:bg-primary/20':
                          !isScheduleCompleted(schedule),
                        'bg-base-200 text-base-content/50 hover:bg-base-300':
                          isScheduleCompleted(schedule),
                      }"
                      :title="`${schedule.practice}\nГруппа: ${schedule.group}\nПреподаватель: ${schedule.teacher}`"
                    >
                      <div class="font-medium">{{ schedule.practice }}</div>
                      <div class="text-[8px] sm:text-[10px] opacity-80">{{ schedule.group }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

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
                        :to="{ name: 'schedule-edit', query: { id: schedule.id } }"
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
                        :to="{ name: 'schedule-edit', query: { id: schedule.id } }"
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

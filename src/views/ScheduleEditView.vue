<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Состояния для формы
const schedule = ref({
  id: null,
  practice: '',
  teacher: '',
  group: '',
  startDate: '',
  endDate: '',
})

// Список практик (заглушка)
const practices = [
  { id: 1, name: 'Производственная практика' },
  { id: 2, name: 'Учебная практика' },
  { id: 3, name: 'Преддипломная практика' },
]

// Список преподавателей (заглушка)
const teachers = [
  { id: 1, name: 'Иванов Иван Иванович' },
  { id: 2, name: 'Петров Петр Петрович' },
  { id: 3, name: 'Сидоров Сидор Сидорович' },
]

// Список групп (заглушка)
const groups = [
  { id: 1, name: 'ИС-21' },
  { id: 2, name: 'ИС-22' },
  { id: 3, name: 'ИС-23' },
]

// Загрузка данных графика
onMounted(() => {
  // Здесь будет запрос к API для получения данных графика
  // Заглушка для демонстрации
  const mockSchedule = {
    id: route.params.id,
    practice: 'Производственная практика',
    teacher: 'Иванов И.И.',
    group: 'ИС-21',
    startDate: '2025-03-01',
    endDate: '2025-03-15',
  }
  schedule.value = { ...mockSchedule }
})

// Функция для сохранения изменений
function saveSchedule() {
  // Здесь будет логика отправки данных на сервер
  console.log('Сохранены изменения графика:', schedule.value)
  router.push('/schedules')
}
</script>

<template>
  <div class="schedule-builder py-4 sm:py-8">
    <div class="mx-auto max-w-2xl px-2 sm:px-4">
      <!-- Заголовок -->
      <div class="flex items-center gap-3 mb-6 sm:mb-8">
        <div
          class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary"
        >
          <i class="fa-solid fa-calendar-plus text-lg sm:text-xl"></i>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold">Редактирование графика</h1>
      </div>

      <!-- Форма редактирования графика -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body p-3 sm:p-6">
          <div class="space-y-4 sm:space-y-6">
            <!-- Выбор практики -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base sm:text-lg font-medium">Практика</span>
              </label>
              <select
                v-model="schedule.practice"
                class="select select-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
              >
                <option v-for="practice in practices" :key="practice.id" :value="practice.id">
                  {{ practice.name }}
                </option>
              </select>
            </div>

            <!-- Выбор преподавателя -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base sm:text-lg font-medium">Преподаватель</span>
              </label>
              <select
                v-model="schedule.teacher"
                class="select select-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
              >
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }}
                </option>
              </select>
            </div>

            <!-- Выбор группы -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base sm:text-lg font-medium">Группа</span>
              </label>
              <select
                v-model="schedule.group"
                class="select select-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
              >
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>

            <!-- Даты -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <!-- Дата начала -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base sm:text-lg font-medium">Дата начала</span>
                </label>
                <input
                  v-model="schedule.startDate"
                  type="date"
                  class="input input-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                />
              </div>

              <!-- Дата окончания -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base sm:text-lg font-medium">Дата окончания</span>
                </label>
                <input
                  v-model="schedule.endDate"
                  type="date"
                  class="input input-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                />
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="card-actions justify-end gap-2 mt-6 sm:mt-8">
            <button class="btn btn-ghost btn-sm sm:btn-md" @click="router.push('/schedules')">
              Отмена
            </button>
            <button class="btn btn-primary btn-sm sm:btn-md gap-2" @click="saveSchedule">
              <i class="fa-solid fa-check"></i>
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-builder {
  min-height: calc(100vh - 64px - 88px);
}
</style>

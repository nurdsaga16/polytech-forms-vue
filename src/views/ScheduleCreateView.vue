<script setup>
import { ref } from 'vue'

// Состояния для формы
const schedule = ref({
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

// Функция для создания графика
function createSchedule() {
  // Здесь будет логика отправки данных на сервер
  console.log('Создан график:', schedule.value)
}
</script>

<template>
  <div class="schedule-builder py-8">
    <div class="mx-auto max-w-2xl px-4">
      <!-- Заголовок -->
      <div class="flex items-center gap-3 mb-8">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
        >
          <i class="fa-solid fa-calendar-plus text-xl"></i>
        </div>
        <h1 class="text-2xl font-bold">Создание графика</h1>
      </div>

      <!-- Форма создания графика -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="space-y-6">
            <!-- Выбор практики -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-lg font-medium">Практика</span>
              </label>
              <select
                v-model="schedule.practice"
                class="select select-bordered w-full h-12 text-lg"
              >
                <option value="" disabled selected>Выберите практику</option>
                <option v-for="practice in practices" :key="practice.id" :value="practice.id">
                  {{ practice.name }}
                </option>
              </select>
            </div>

            <!-- Выбор преподавателя -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-lg font-medium">Преподаватель</span>
              </label>
              <select v-model="schedule.teacher" class="select select-bordered w-full h-12 text-lg">
                <option value="" disabled selected>Выберите преподавателя</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }}
                </option>
              </select>
            </div>

            <!-- Выбор группы -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-lg font-medium">Группа</span>
              </label>
              <select v-model="schedule.group" class="select select-bordered w-full h-12 text-lg">
                <option value="" disabled selected>Выберите группу</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>

            <!-- Даты -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Дата начала -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-lg font-medium">Дата начала</span>
                </label>
                <input
                  v-model="schedule.startDate"
                  type="date"
                  class="input input-bordered w-full h-12 text-lg"
                />
              </div>

              <!-- Дата окончания -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-lg font-medium">Дата окончания</span>
                </label>
                <input
                  v-model="schedule.endDate"
                  type="date"
                  class="input input-bordered w-full h-12 text-lg"
                />
              </div>
            </div>
          </div>

          <!-- Кнопка создания -->
          <div class="card-actions justify-end mt-8">
            <button class="btn btn-primary gap-2" @click="createSchedule">
              <i class="fa-solid fa-check"></i>
              Создать график
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

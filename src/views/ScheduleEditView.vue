<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useGroupsStore } from '../stores/useGroupsStore'
import { usePracticesStore } from '../stores/usePracticesStore'
import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const scheduleStore = useScheduleStore()
const groupsStore = useGroupsStore()
const practicesStore = usePracticesStore()
const authStore = useAuthStore()

const schedule = ref({
  user_id: authStore.authData?.userId,
  practice_id: '',
  group_id: '',
  start_date: '',
  end_date: '',
})

const error = ref('')
const scheduleId = route.query.id

onMounted(async () => {
  if (!authStore.authData?.userId) {
    router.push('/login')
    return
  }

  if (!scheduleId) {
    router.push('/schedules')
    return
  }

  try {
    // Загружаем все данные параллельно
    const [scheduleData] = await Promise.all([
      scheduleStore.fetchSchedule(scheduleId),
      groupsStore.fetchGroups(),
      practicesStore.fetchPractices(),
    ])

    if (scheduleData) {
      schedule.value = {
        user_id: authStore.authData.userId,
        group_id: scheduleData.group.id,
        practice_id: scheduleData.practice.id,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date,
      }
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке данных'
    console.error(err)
  }
})

const saveSchedule = async () => {
  try {
    error.value = ''
    schedule.value.user_id = authStore.authData?.userId
    await scheduleStore.updateSchedule(scheduleId, schedule.value)
    router.push('/schedules')
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при обновлении расписания'
  }
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

      <!-- Загрузка -->
      <div
        v-if="scheduleStore.loading || groupsStore.loading || practicesStore.loading"
        class="flex justify-center py-8"
      >
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Форма редактирования графика -->
      <div v-else class="card bg-base-100 shadow-lg">
        <div class="card-body p-3 sm:p-6">
          <div class="space-y-4 sm:space-y-6">
            <!-- Выбор практики -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base sm:text-lg font-medium">Практика</span>
              </label>
              <select
                v-model="schedule.practice_id"
                class="select select-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                required
              >
                <option
                  v-for="practice in practicesStore.practices"
                  :key="practice.id"
                  :value="practice.id"
                >
                  {{ practice.title }}
                </option>
              </select>
            </div>

            <!-- Выбор группы -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base sm:text-lg font-medium">Группа</span>
              </label>
              <select
                v-model="schedule.group_id"
                class="select select-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                required
              >
                <option v-for="group in groupsStore.groups" :key="group.id" :value="group.id">
                  {{ group.title }}
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
                  v-model="schedule.start_date"
                  type="date"
                  class="input input-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                  required
                />
              </div>

              <!-- Дата окончания -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base sm:text-lg font-medium">Дата окончания</span>
                </label>
                <input
                  v-model="schedule.end_date"
                  type="date"
                  class="input input-bordered w-full h-10 sm:h-12 text-base sm:text-lg"
                  required
                />
              </div>
            </div>

            <!-- Ошибка -->
            <div v-if="error" class="alert alert-error">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="card-actions justify-end gap-2 mt-6 sm:mt-8">
            <button class="btn btn-ghost btn-sm sm:btn-md" @click="router.push('/schedules')">
              Отмена
            </button>
            <button
              class="btn btn-primary btn-sm sm:btn-md gap-2"
              @click="saveSchedule"
              :disabled="scheduleStore.loading"
            >
              <span v-if="scheduleStore.loading" class="loading loading-spinner loading-sm"></span>
              <i v-else class="fa-solid fa-check"></i>
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

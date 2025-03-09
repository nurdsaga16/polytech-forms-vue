<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useGroupsStore } from '../stores/useGroupsStore'
import { usePracticesStore } from '../stores/usePracticesStore'
import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
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

onMounted(async () => {
  if (!authStore.authData?.userId) {
    router.push('/login')
    return
  }
  await Promise.all([groupsStore.fetchGroups(), practicesStore.fetchPractices()])
})

const createSchedule = async () => {
  try {
    error.value = ''
    schedule.value.user_id = authStore.authData?.userId
    await scheduleStore.createSchedule(schedule.value)
    router.push('/schedules')
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при создании расписания'
  }
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

      <!-- Загрузка -->
      <div v-if="groupsStore.loading || practicesStore.loading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Форма создания графика -->
      <div v-else class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="space-y-6">
            <!-- Выбор практики -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-lg font-medium">Практика</span>
              </label>
              <select
                v-model="schedule.practice_id"
                class="select select-bordered w-full h-12 text-lg"
                required
              >
                <option value="" disabled selected>Выберите практику</option>
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
                <span class="label-text text-lg font-medium">Группа</span>
              </label>
              <select
                v-model="schedule.group_id"
                class="select select-bordered w-full h-12 text-lg"
                required
              >
                <option value="" disabled selected>Выберите группу</option>
                <option v-for="group in groupsStore.groups" :key="group.id" :value="group.id">
                  {{ group.title }}
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
                  v-model="schedule.start_date"
                  type="date"
                  class="input input-bordered w-full h-12 text-lg"
                  required
                />
              </div>

              <!-- Дата окончания -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-lg font-medium">Дата окончания</span>
                </label>
                <input
                  v-model="schedule.end_date"
                  type="date"
                  class="input input-bordered w-full h-12 text-lg"
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

          <!-- Кнопка создания -->
          <div class="card-actions justify-end mt-8">
            <button
              class="btn btn-primary gap-2"
              @click="createSchedule"
              :disabled="scheduleStore.loading"
            >
              <span v-if="scheduleStore.loading" class="loading loading-spinner loading-sm"></span>
              <i v-else class="fa-solid fa-check"></i>
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

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([])
  const currentSchedule = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const authStore = useAuthStore()
  const token = computed(() => authStore.authData?.token)

  // Получение всех расписаний
  async function fetchSchedules() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/schedules', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      schedules.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке расписаний'
      console.error('Ошибка при загрузке расписаний:', err)
    } finally {
      loading.value = false
    }
  }

  // Получение конкретного расписания
  async function fetchSchedule(id) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get(`/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      currentSchedule.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке расписания'
      console.error('Ошибка при загрузке расписания:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Создание расписания
  async function createSchedule(scheduleData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/schedules', scheduleData, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSchedules() // Обновляем список после создания
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при создании расписания'
      console.error('Ошибка при создании расписания:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление расписания
  async function updateSchedule(id, scheduleData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.put(`/schedules/${id}`, scheduleData, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSchedules() // Обновляем список после изменения
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при обновлении расписания'
      console.error('Ошибка при обновлении расписания:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удаление расписания
  async function deleteSchedule(id) {
    try {
      loading.value = true
      error.value = null
      await api.delete(`/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSchedules() // Обновляем список после удаления
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при удалении расписания'
      console.error('Ошибка при удалении расписания:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    currentSchedule,
    error,
    loading,
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
})

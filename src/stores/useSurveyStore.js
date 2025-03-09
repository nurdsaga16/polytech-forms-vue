import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useSurveyStore = defineStore('survey', () => {
  // Состояние
  const surveys = ref([])
  const currentSurvey = ref(null)
  const error = ref(null)
  const loading = ref(false)

  // Получение токена авторизации
  const authStore = useAuthStore()
  const token = computed(() => authStore.authData?.token)

  // Получение всех опросов
  async function fetchSurveys() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/surveys', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      surveys.value = response.data.data // Извлекаем массив опросов из поля data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке опросов'
      console.error('Ошибка при загрузке опросов:', err)
    } finally {
      loading.value = false
    }
  }

  // Получение конкретного опроса
  async function fetchSurvey(id) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get(`/surveys/${id}`)
      currentSurvey.value = response.data.data // Извлекаем опрос из поля data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке опроса'
      console.error('Ошибка при загрузке опроса:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Создание опроса
  async function createSurvey(surveyData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/surveys', surveyData, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSurveys() // Обновляем список после создания
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при создании опроса'
      console.error('Ошибка при создании опроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление опроса
  async function updateSurvey(id, surveyData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.put(`/surveys/${id}`, surveyData, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSurveys() // Обновляем список после изменения
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при обновлении опроса'
      console.error('Ошибка при обновлении опроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удаление опроса
  async function deleteSurvey(id) {
    try {
      loading.value = true
      error.value = null
      await api.delete(`/surveys/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      await fetchSurveys() // Обновляем список после удаления
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при удалении опроса'
      console.error('Ошибка при удалении опроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    surveys,
    currentSurvey,
    error,
    loading,
    fetchSurveys,
    fetchSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,
  }
})

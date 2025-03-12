import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useSurveyStore = defineStore('survey', () => {
  // Состояние
  const surveys = ref([]) // Список всех опросов
  const currentSurvey = ref(null) // Текущий выбранный опрос
  const loading = ref(false) // Состояние загрузки
  const error = ref(null) // Ошибки запросов

  // Получение токена из useAuthStore
  const authStore = useAuthStore()
  const token = computed(() => authStore.authData?.token)

  // Конфигурация заголовков для запросов
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  })

  // Получение всех опросов
  async function fetchSurveys() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/surveys', getAuthHeaders())
      surveys.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке опросов'
      console.error('Ошибка при загрузке опросов:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получение конкретного опроса
  async function fetchSurvey(id) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get(`/surveys/${id}`, getAuthHeaders())
      currentSurvey.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке опроса'
      console.error('Ошибка при загрузке опроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Создание опроса
  async function createSurvey(surveyData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/surveys', surveyData, getAuthHeaders())
      await fetchSurveys() // Обновляем список опросов
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
      const response = await api.put(`/surveys/${id}`, surveyData, getAuthHeaders())
      await fetchSurvey(id) // Обновляем текущий опрос
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
      await api.delete(`/surveys/${id}`, getAuthHeaders())
      await fetchSurveys() // Обновляем список опросов
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при удалении опроса'
      console.error('Ошибка при удалении опроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Создание вопроса
  async function createQuestion(questionData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/questions', questionData, getAuthHeaders())
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при создании вопроса'
      console.error('Ошибка при создании вопроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление вопроса
  async function updateQuestion(id, questionData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.put(`/questions/${id}`, questionData, getAuthHeaders())
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при обновлении вопроса'
      console.error('Ошибка при обновлении вопроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удаление вопроса
  async function deleteQuestion(id) {
    try {
      loading.value = true
      error.value = null
      await api.delete(`/questions/${id}`, getAuthHeaders())
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при удалении вопроса'
      console.error('Ошибка при удалении вопроса:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Создание варианта ответа
  async function createAnswerOption(optionData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/answer-options', optionData, getAuthHeaders())
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при создании варианта ответа'
      console.error('Ошибка при создании варианта ответа:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление варианта ответа
  async function updateAnswerOption(id, optionData) {
    try {
      loading.value = true
      error.value = null
      console.log('Отправка PUT-запроса на /answer-options/', id, 'с данными:', optionData)
      const response = await api.put(`/answer-options/${id}`, optionData, getAuthHeaders())
      console.log('Ответ сервера от updateAnswerOption:', response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при обновлении варианта ответа'
      console.error('Ошибка в updateAnswerOption:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удаление варианта ответа
  async function deleteAnswerOption(id) {
    try {
      loading.value = true
      error.value = null
      await api.delete(`/answer-options/${id}`, getAuthHeaders())
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при удалении варианта ответа'
      console.error('Ошибка при удалении варианта ответа:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Экспорт состояния и методов
  return {
    surveys,
    currentSurvey,
    loading,
    error,
    fetchSurveys,
    fetchSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createAnswerOption,
    updateAnswerOption,
    deleteAnswerOption,
  }
})

// src/stores/useResponseStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useResponseStore = defineStore('response', () => {
  // Состояние
  const responses = ref([])
  const error = ref(null)
  const loading = ref(false)

  // Получение токена авторизации
  const authStore = useAuthStore()
  const token = authStore.authData?.token

  // Получение всех ответов
  async function fetchResponses() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/responses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      responses.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке ответов'
      console.error('Ошибка при загрузке ответов:', err)
    } finally {
      loading.value = false
    }
  }

  // Получение конкретного ответа
  async function fetchResponse(id) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get(`/responses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке ответа'
      console.error('Ошибка при загрузке ответа:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Отправка ответов на опрос
  async function submitResponse(responseData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.post('/responses', responseData)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при отправке ответов'
      console.error('Ошибка при отправке ответов:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    responses,
    error,
    loading,
    fetchResponses,
    fetchResponse,
    submitResponse,
  }
})

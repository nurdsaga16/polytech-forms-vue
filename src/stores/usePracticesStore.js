import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const usePracticesStore = defineStore('practices', () => {
  const practices = ref([])
  const error = ref(null)
  const loading = ref(false)

  const authStore = useAuthStore()
  const token = computed(() => authStore.authData?.token)

  async function fetchPractices() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/practices', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      practices.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке практик'
      console.error('Ошибка при загрузке практик:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    practices,
    error,
    loading,
    fetchPractices,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref([])
  const error = ref(null)
  const loading = ref(false)

  const authStore = useAuthStore()
  const token = computed(() => authStore.authData?.token)

  async function fetchGroups() {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/groups', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      groups.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке групп'
      console.error('Ошибка при загрузке групп:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    error,
    loading,
    fetchGroups,
  }
})

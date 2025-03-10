import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index'
import { useAuthStore } from './useAuthStore'

export const useProfileStore = defineStore('profile', () => {
  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const token = computed(() => authStore.authData?.token)

  async function fetchUserData(id) {
    try {
      const response = await api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      userData.value = response.data
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error)
    } finally {
      loading.value = false
    }
  }

  const clearUserData = () => {
    userData.value = null
    error.value = null
  }

  async function updateProfile(full_name, email, password, avatar) {
    try {
      await api.put(
        '/users',
        { full_name, email, password, avatar },
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      )
      await fetchUserData(authStore.authData.userId)
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
    }
  }

  return {
    userData,
    loading,
    error,
    fetchUserData,
    clearUserData,
    updateProfile,
  }
})

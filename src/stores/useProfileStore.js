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
    loading.value = true // Устанавливаем loading перед запросом
    error.value = null // Сбрасываем ошибку перед новым запросом
    try {
      const response = await api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
      userData.value = response.data
    } catch (err) {
      console.error('Ошибка при загрузке данных пользователя:', err)
      error.value = err.message || 'Не удалось загрузить данные пользователя'
    } finally {
      loading.value = false // Сбрасываем loading после завершения
    }
  }

  const clearUserData = () => {
    userData.value = null
    error.value = null
    loading.value = false // Сбрасываем loading при очистке данных
  }

  async function updateProfile(full_name, email, password, avatar) {
    loading.value = true // Устанавливаем loading перед запросом
    error.value = null // Сбрасываем ошибку перед новым запросом
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
      // Обновляем данные пользователя после успешного изменения
      await fetchUserData(authStore.authData.userId)
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err)
      error.value = err.message || 'Не удалось обновить профиль'
    } finally {
      loading.value = false // Сбрасываем loading после завершения
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/index'
import Cookies from 'universal-cookie'

export const useAuthStore = defineStore('auth', () => {
  const authData = ref(null)
  const cookies = new Cookies()
  const router = useRouter()

  async function login(email, password) {
    try {
      const response = await api.post('/login', { email, password })
      saveAuthData({
        token: response.data.token,
        userId: response.data.user.id,
      })
      router.push('/')
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async function logout() {
    try {
      if (authData.value?.token) {
        await api.post('/logout', null, {
          headers: {
            Authorization: `Bearer ${authData.value.token}`,
          },
        })
      }
      removeAuthData()
      router.push('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      // Даже если произошла ошибка, все равно очищаем данные и перенаправляем
      removeAuthData()
      router.push('/login')
    }
  }

  function saveAuthData(data) {
    authData.value = data
    cookies.set('authData', data, { path: '/' })
  }

  function removeAuthData() {
    authData.value = null
    cookies.remove('authData', { path: '/' })
  }

  function readAuthData() {
    const storedData = cookies.get('authData')
    if (storedData) {
      authData.value = storedData
    }
  }

  readAuthData()

  return {
    authData,
    login,
    logout,
    removeAuthData,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/index'
import Cookies from 'universal-cookie'

export const useAuthStore = defineStore('auth', () => {
  const authData = ref(null)
  const emailVerified = ref(false) // По умолчанию false, пока не проверим
  const cookies = new Cookies()
  const router = useRouter()

  // Логин
  async function login(email, password) {
    try {
      const response = await api.post('/login', { email, password })
      console.log('Login response:', response.data) // Отладка
      saveAuthData({
        token: response.data.token,
        userId: response.data.user.id,
        message: response.data.message,
      })
      emailVerified.value = response.data.user.email_verified_at !== null // Устанавливаем статус верификации
      cookies.set('emailVerified', emailVerified.value, { path: '/' }) // Сохраняем в cookies
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  // Выход
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
      removeAuthData()
      router.push('/login')
    }
  }

  // Отправка письма для верификации
  async function sendVerificationEmail() {
    try {
      const response = await api.post(
        '/email/verification-notification',
        {},
        {
          headers: {
            Authorization: `Bearer ${authData.value.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send verification email')
    }
  }

  // Проверка статуса верификации
  async function checkVerificationStatus() {
    if (!authData.value?.token) return
    try {
      const response = await api.get(`/users/${authData.value.userId}`, {
        headers: {
          Authorization: `Bearer ${authData.value.token}`,
        },
      })
      console.log('Check verification response:', response.data)
      emailVerified.value = response.data.email_verified_at !== null
      cookies.set('emailVerified', emailVerified.value, { path: '/' }) // Сохраняем статус верификации
      return response.data
    } catch (error) {
      console.error('Ошибка проверки статуса верификации:', error)
      emailVerified.value = false
      cookies.set('emailVerified', emailVerified.value, { path: '/' })
      throw error
    }
  }

  // Восстановление состояния авторизации
  async function restoreAuth() {
    const storedAuthData = cookies.get('authData')
    const storedEmailVerified = cookies.get('emailVerified')

    if (storedAuthData && storedAuthData.token) {
      authData.value = storedAuthData
      emailVerified.value = storedEmailVerified !== null ? storedEmailVerified : false
      try {
        // Проверяем токен и статус верификации через API
        const response = await api.get(`/users/${authData.value.userId}`, {
          headers: {
            Authorization: `Bearer ${authData.value.token}`,
          },
        })
        console.log('Restore auth response:', response.data)
        emailVerified.value = response.data.email_verified_at !== null
        cookies.set('emailVerified', emailVerified.value, { path: '/' })
      } catch (error) {
        console.error('Ошибка восстановления авторизации:', error)
        removeAuthData() // Если токен недействителен, очищаем состояние
        throw error
      }
    }
  }

  // Запрос на восстановление пароля
  async function forgotPassword(email) {
    try {
      const response = await api.post('/forgot-password', { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link')
    }
  }

  // Сброс пароля
  async function resetPassword({ email, password, password_confirmation, token }) {
    try {
      const response = await api.post('/reset-password', {
        email,
        password,
        password_confirmation,
        token,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  // Сохранение данных авторизации
  function saveAuthData(data) {
    authData.value = data
    cookies.set('authData', data, { path: '/' })
  }

  // Удаление данных авторизации
  function removeAuthData() {
    authData.value = null
    emailVerified.value = false
    cookies.remove('authData', { path: '/' })
    cookies.remove('emailVerified', { path: '/' })
  }

  // Чтение данных при инициализации
  function readAuthData() {
    const storedAuthData = cookies.get('authData')
    const storedEmailVerified = cookies.get('emailVerified')
    if (storedAuthData) {
      authData.value = storedAuthData
      emailVerified.value = storedEmailVerified !== null ? storedEmailVerified : false
      // Не вызываем checkVerificationStatus здесь, чтобы избежать лишнего запроса
    }
  }

  // Инициализация состояния
  readAuthData()

  return {
    authData,
    emailVerified,
    login,
    logout,
    sendVerificationEmail,
    removeAuthData,
    checkVerificationStatus,
    restoreAuth,
    forgotPassword,
    resetPassword,
  }
})

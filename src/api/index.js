import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Добавляем перехватчик для обработки ошибок
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message)
//     return Promise.reject(error)
//   },
// )

// Добавляем перехватчик для установки заголовков авторизации
// api.interceptors.request.use((config) => {
//   // Если запрос отправляет FormData, не устанавливаем Content-Type
//   if (config.data instanceof FormData) {
//     delete config.headers['Content-Type']
//   }
//   return config
// })

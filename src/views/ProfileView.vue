<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '../stores/useProfileStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter } from 'vue-router'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()

const showModal = ref(false)
const editedUser = ref({
  full_name: '',
  email: '',
  password: '',
  avatar: null,
})
const confirmPassword = ref('')
const passwordError = ref('')
const verificationMessage = ref('') // Сообщение будет браться из response
const isVerifying = ref(false)
const showVerifyButton = ref(true)
let verificationInterval = null

onMounted(async () => {
  if (authStore.authData?.userId) {
    await profileStore.fetchUserData(authStore.authData.userId)
    console.log('Email verified:', authStore.emailVerified)
    if (!authStore.emailVerified) {
      // Устанавливаем сообщение из authData.message, если оно есть
      verificationMessage.value =
        authStore.authData?.message || 'Пожалуйста, подтвердите вашу электронную почту.'
      isVerifying.value = true
    }
  }
})

onUnmounted(() => {
  if (verificationInterval) {
    clearInterval(verificationInterval)
  }
})

const openModal = () => {
  editedUser.value = {
    full_name: profileStore.userData?.full_name || '',
    email: profileStore.userData?.email || '',
    password: '',
    avatar: profileStore.userData?.avatar || null,
  }
  confirmPassword.value = ''
  passwordError.value = ''
  showModal.value = true
}

const saveChanges = async () => {
  if (editedUser.value.password || confirmPassword.value) {
    if (editedUser.value.password !== confirmPassword.value) {
      passwordError.value = 'Пароли не совпадают'
      return
    }
  }

  try {
    const emailChanged = editedUser.value.email !== profileStore.userData?.email
    await profileStore.updateProfile(
      editedUser.value.full_name,
      editedUser.value.email,
      editedUser.value.password || undefined,
      editedUser.value.avatar || undefined,
      emailChanged,
    )
    showModal.value = false
    if (emailChanged) {
      authStore.emailVerified = false
      verificationMessage.value = 'Пожалуйста, подтвердите вашу новую электронную почту.' // Начальное сообщение
      isVerifying.value = true
      showVerifyButton.value = true
    }
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
  }
}

const sendVerification = async () => {
  try {
    const response = await authStore.sendVerificationEmail()
    // Устанавливаем сообщение из ответа сервера
    verificationMessage.value = response.message
    showVerifyButton.value = false
    console.log('Verification sent:', response)
    startVerificationCheck()
  } catch (err) {
    // Устанавливаем сообщение об ошибке из ответа сервера, если оно есть
    verificationMessage.value = err.message || 'Ошибка при отправке письма верификации'
    console.error('Ошибка при отправке письма верификации:', err)
    showVerifyButton.value = true
  }
}

const startVerificationCheck = () => {
  if (verificationInterval) {
    clearInterval(verificationInterval)
  }
  verificationInterval = setInterval(async () => {
    try {
      const response = await authStore.checkVerificationStatus()
      console.log('Verification status checked:', authStore.emailVerified)
      if (authStore.emailVerified) {
        // Предполагаем, что сервер вернет сообщение об успехе в будущем
        verificationMessage.value = response?.message || 'Электронная почта успешно подтверждена'
        isVerifying.value = false
        clearInterval(verificationInterval)
        setTimeout(() => {
          verificationMessage.value = ''
          router.push('/profile')
        }, 2000)
      }
    } catch (err) {
      console.error('Ошибка проверки верификации:', err)
    }
  }, 5000)
}
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <div class="flex flex-col items-center gap-4 sm:gap-8 max-w-2xl mx-auto">
      <!-- Аватарка -->
      <div class="avatar">
        <div class="w-24 sm:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <div
            v-if="profileStore.loading || !profileStore.userData"
            class="w-full h-full rounded-full bg-base-300 animate-pulse"
          ></div>
          <img
            v-else
            :src="
              profileStore.userData?.avatar ||
              'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
            "
            alt="Avatar"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Информация о пользователе -->
      <div class="text-center space-y-1 sm:space-y-2">
        <div
          v-if="profileStore.loading || !profileStore.userData"
          class="w-40 h-6 sm:h-8 bg-base-300 rounded animate-pulse mx-auto"
        ></div>
        <h2 v-else class="text-xl sm:text-2xl font-bold">{{ profileStore.userData?.full_name }}</h2>

        <div
          v-if="profileStore.loading || !profileStore.userData"
          class="w-32 h-4 sm:h-5 bg-base-300 rounded animate-pulse mx-auto"
        ></div>
        <p v-else class="text-sm sm:text-base text-base-content/70">
          {{ profileStore.userData?.email }}
        </p>

        <!-- Сообщение о верификации -->
        <div
          v-if="isVerifying || verificationMessage"
          :class="[
            'alert mt-4 p-4 rounded-2xl shadow-md transition-all duration-300 bg-base-100',
            verificationMessage === 'Электронная почта успешно подтверждена'
              ? 'border-2 border-success bg-success/30 text-success-dark'
              : 'border-2 border-warning bg-warning/40 text-warning-dark',
          ]"
        >
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-envelope text-lg sm:text-xl animate-pulse"></i>
            <span class="font-medium text-sm sm:text-base">
              {{ verificationMessage }}
            </span>
            <a
              v-if="showVerifyButton && !authStore.emailVerified"
              @click.prevent="sendVerification"
              class="ml-auto underline cursor-pointer text-sm sm:text-base transition-colors duration-200"
            >
              Подтвердить
            </a>
          </div>
        </div>

        <div
          v-if="profileStore.loading || !profileStore.userData"
          class="w-24 h-4 sm:h-5 bg-base-300 rounded animate-pulse mx-auto"
        ></div>
        <p v-else class="text-primary font-medium text-sm sm:text-base">Преподаватель</p>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
        <!-- Создано графиков -->
        <div
          class="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary transition-colors duration-300"
        >
          <div class="flex flex-col">
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-primary mb-2">
              {{ profileStore.userData?.schedules_created || 0 }}
            </div>
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-24 h-4 bg-base-300 rounded animate-pulse mt-2"
            ></div>
            <div v-else class="text-sm text-base-content/70">Создано графиков</div>
          </div>
        </div>

        <!-- Активных графиков -->
        <div
          class="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary transition-colors duration-300"
        >
          <div class="flex flex-col">
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-primary mb-2">
              {{ profileStore.userData?.active_schedules || 0 }}
            </div>
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-24 h-4 bg-base-300 rounded animate-pulse mt-2"
            ></div>
            <div v-else class="text-sm text-base-content/70">Активных графиков</div>
          </div>
        </div>

        <!-- Создано опросов -->
        <div
          class="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-secondary transition-colors duration-300"
        >
          <div class="flex flex-col">
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-secondary mb-2">
              {{ profileStore.userData?.surveys_created || 0 }}
            </div>
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-24 h-4 bg-base-300 rounded animate-pulse mt-2"
            ></div>
            <div v-else class="text-sm text-base-content/70">Создано опросов</div>
          </div>
        </div>

        <!-- Активных опросов -->
        <div
          class="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-secondary transition-colors duration-300"
        >
          <div class="flex flex-col">
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-secondary mb-2">
              {{ profileStore.userData?.active_surveys || 0 }}
            </div>
            <div
              v-if="profileStore.loading || !profileStore.userData"
              class="w-24 h-4 bg-base-300 rounded animate-pulse mt-2"
            ></div>
            <div v-else class="text-sm text-base-content/70">Активных опросов</div>
          </div>
        </div>
      </div>

      <!-- Кнопка -->
      <div
        v-if="profileStore.loading || !profileStore.userData"
        class="w-40 h-10 bg-base-300 rounded animate-pulse"
      ></div>
      <button v-else class="btn btn-primary btn-sm sm:btn-md" @click="openModal">
        Редактировать профиль
      </button>
    </div>

    <!-- Модальное окно -->
    <dialog class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box max-w-sm sm:max-w-md overflow-x-hidden">
        <h3 class="font-bold text-base sm:text-lg mb-4">Редактировать профиль</h3>

        <div class="space-y-3 sm:space-y-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm sm:text-base">Аватар</span>
            </label>
            <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div class="avatar">
                <div class="w-16 sm:w-20 rounded-full">
                  <img
                    :src="
                      editedUser.avatar ||
                      'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                    "
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <input
                type="text"
                v-model="editedUser.avatar"
                placeholder="Введите URL изображения"
                class="input input-bordered w-full text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm sm:text-base">ФИО</span>
            </label>
            <input
              type="text"
              v-model="editedUser.full_name"
              placeholder="Введите ФИО"
              class="input input-bordered w-full text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm sm:text-base">Email</span>
            </label>
            <input
              type="email"
              v-model="editedUser.email"
              placeholder="Введите email"
              class="input input-bordered w-full text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm sm:text-base whitespace-normal">Новый пароль</span>
              <span class="label-text-alt text-base-content/50 text-xs whitespace-normal"
                >(Оставьте пустым, чтобы не менять)</span
              >
            </label>
            <input
              type="password"
              v-model="editedUser.password"
              placeholder="Введите новый пароль"
              class="input input-bordered w-full text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm sm:text-base whitespace-normal"
                >Подтвердите пароль</span
              >
              <span class="label-text-alt text-base-content/50 text-xs whitespace-normal"
                >(Оставьте пустым, чтобы не менять)</span
              >
            </label>
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Подтвердите пароль"
              class="input input-bordered w-full text-sm sm:text-base h-9 sm:h-10"
              :class="{ 'input-error': passwordError }"
            />
            <label class="label" v-if="passwordError">
              <span class="label-text-alt text-error text-xs sm:text-sm">{{ passwordError }}</span>
            </label>
          </div>
        </div>

        <div class="modal-action mt-4 sm:mt-6">
          <button class="btn btn-sm sm:btn-md" @click="showModal = false">Отмена</button>
          <button class="btn btn-primary btn-sm sm:btn-md" @click="saveChanges">Сохранить</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>

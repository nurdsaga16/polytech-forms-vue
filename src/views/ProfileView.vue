<script setup>
import { ref, onMounted } from 'vue'
import { useProfileStore } from '../stores/useProfileStore'
import { useAuthStore } from '../stores/useAuthStore'

const profileStore = useProfileStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editedUser = ref({
  full_name: '',
  email: '',
  password: '',
  avatar: null,
})
const confirmPassword = ref('')
const passwordError = ref('')

onMounted(async () => {
  if (authStore.authData?.userId) {
    await profileStore.fetchUserData(authStore.authData.userId)
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
    await profileStore.updateProfile(
      editedUser.value.full_name,
      editedUser.value.email,
      editedUser.value.password || undefined,
      editedUser.value.avatar || undefined,
    )
    showModal.value = false
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
  }
}
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <div class="flex flex-col items-center gap-4 sm:gap-8 max-w-2xl mx-auto">
      <!-- Аватарка -->
      <div class="avatar">
        <div class="w-24 sm:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <div
            v-if="profileStore.loading"
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
        <h2
          v-if="profileStore.loading"
          class="w-40 h-6 sm:h-8 bg-base-300 rounded animate-pulse mx-auto"
        ></h2>
        <h2 v-else class="text-xl sm:text-2xl font-bold">{{ profileStore.userData?.full_name }}</h2>

        <p
          v-if="profileStore.loading"
          class="w-32 h-4 sm:h-5 bg-base-300 rounded animate-pulse mx-auto"
        ></p>
        <p v-else class="text-sm sm:text-base text-base-content/70">
          {{ profileStore.userData?.email }}
        </p>

        <p
          v-if="profileStore.loading"
          class="w-24 h-4 sm:h-5 bg-base-300 rounded animate-pulse mx-auto"
        ></p>
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
              v-if="profileStore.loading"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-primary mb-2">
              {{ profileStore.userData?.schedules_created || 0 }}
            </div>
            <div
              v-if="profileStore.loading"
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
              v-if="profileStore.loading"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-primary mb-2">
              {{ profileStore.userData?.active_schedules || 0 }}
            </div>
            <div
              v-if="profileStore.loading"
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
              v-if="profileStore.loading"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-secondary mb-2">
              {{ profileStore.userData?.surveys_created || 0 }}
            </div>
            <div
              v-if="profileStore.loading"
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
              v-if="profileStore.loading"
              class="w-12 h-10 bg-base-300 rounded animate-pulse"
            ></div>
            <div v-else class="text-4xl font-bold text-secondary mb-2">
              {{ profileStore.userData?.active_surveys || 0 }}
            </div>
            <div
              v-if="profileStore.loading"
              class="w-24 h-4 bg-base-300 rounded animate-pulse mt-2"
            ></div>
            <div v-else class="text-sm text-base-content/70">Активных опросов</div>
          </div>
        </div>
      </div>

      <!-- Кнопка -->
      <div v-if="profileStore.loading" class="w-40 h-10 bg-base-300 rounded animate-pulse"></div>
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

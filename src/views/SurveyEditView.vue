<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Состояния для данных формы
const surveyTitle = ref('')
const surveyDescription = ref('')
const selectedSchedule = ref('')
const blocks = ref([])
const isLoading = ref(true)

// Состояние для модальных окон
const showTypeSelectionModal = ref(false)
const showQuestionModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirmationModal = ref(false)
const selectedBlockType = ref('')
const newBlock = ref({
  type: '',
  question: '',
  options: [],
  scale: { min: 1, max: 10 },
})

// Состояние для редактирования вопроса
const editingBlock = ref(null)

// Состояние для удаления вопроса
const blockToDeleteIndex = ref(null)

// Список графиков (заглушка)
const schedules = ref([
  { id: 1, name: 'Производственная практика - ИС-21' },
  { id: 2, name: 'Учебная практика - ИС-22' },
  { id: 3, name: 'Преддипломная практика - ИС-23' },
])

// Загрузка данных опроса
onMounted(async () => {
  try {
    // Здесь будет запрос к API для получения данных опроса
    // Временная заглушка
    const mockSurvey = {
      id: route.params.id,
      title: 'Оценка качества преподавания',
      description: 'Опрос по оценке качества преподавания в текущем семестре',
      questions: [
        {
          type: 'Множественный выбор',
          question: 'Как вы оцениваете качество преподавания?',
          options: ['Отлично', 'Хорошо', 'Удовлетворительно', 'Плохо'],
        },
        {
          type: 'Шкала оценок',
          question: 'Оцените доступность объяснения материала',
          scale: { min: 1, max: 10 },
        },
      ],
    }

    surveyTitle.value = mockSurvey.title
    surveyDescription.value = mockSurvey.description
    blocks.value = mockSurvey.questions
  } catch (error) {
    console.error('Ошибка при загрузке опроса:', error)
  } finally {
    isLoading.value = false
  }
})

// Открытие модального окна для выбора типа ответа
function openTypeSelectionModal() {
  showTypeSelectionModal.value = true
}

// Открытие модального окна для добавления вопроса
function openQuestionModal(type) {
  selectedBlockType.value = type
  newBlock.value.type = type
  showTypeSelectionModal.value = false
  showQuestionModal.value = true

  // Инициализация данных в зависимости от типа блока
  if (type === 'Множественный выбор') {
    newBlock.value.options = ['', '']
  }
}

// Закрытие модального окна для добавления вопроса
function closeQuestionModal() {
  showQuestionModal.value = false
  resetNewBlock()
}

// Добавление блока
function addBlock() {
  blocks.value.push({ ...newBlock.value })
  closeQuestionModal()
}

// Открытие модального окна подтверждения удаления
function openDeleteConfirmationModal(index) {
  blockToDeleteIndex.value = index
  showDeleteConfirmationModal.value = true
}

// Подтверждение удаления вопроса
function confirmDeleteBlock() {
  if (blockToDeleteIndex.value !== null) {
    blocks.value.splice(blockToDeleteIndex.value, 1)
    blockToDeleteIndex.value = null
    showDeleteConfirmationModal.value = false
  }
}

// Отмена удаления вопроса
function cancelDeleteBlock() {
  blockToDeleteIndex.value = null
  showDeleteConfirmationModal.value = false
}

// Сброс данных нового блока
function resetNewBlock() {
  newBlock.value = {
    type: '',
    question: '',
    options: [],
    scale: { min: 1, max: 10 },
  }
}

// Добавление опции для множественного выбора
function addOption() {
  newBlock.value.options.push('')
}

// Удаление опции для множественного выбора
function removeOption(index) {
  newBlock.value.options.splice(index, 1)
}

// Функция для перемещения вопроса вверх
function moveQuestionUp(index) {
  if (index > 0) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index - 1]
    blocks.value[index - 1] = temp
  }
}

// Функция для перемещения вопроса вниз
function moveQuestionDown(index) {
  if (index < blocks.value.length - 1) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index + 1]
    blocks.value[index + 1] = temp
  }
}

// Функция для открытия модального окна редактирования
function openEditModal(block, index) {
  editingBlock.value = { ...block, index }
  showEditModal.value = true
}

// Функция для сохранения изменений
function saveEditedBlock() {
  if (editingBlock.value !== null) {
    blocks.value[editingBlock.value.index] = {
      ...editingBlock.value,
    }
    showEditModal.value = false
    editingBlock.value = null
  }
}

// Функция для закрытия модального окна
function closeEditModal() {
  showEditModal.value = false
  editingBlock.value = null
}

// Функция для сохранения опроса
async function saveSurvey() {
  try {
    // Здесь будет запрос к API для сохранения изменений
    console.log('Сохранение опроса:', {
      id: route.params.id,
      title: surveyTitle.value,
      description: surveyDescription.value,
      questions: blocks.value,
    })
    router.push('/surveys')
  } catch (error) {
    console.error('Ошибка при сохранении опроса:', error)
  }
}

// Вычисляемое свойство для проверки, есть ли вопросы
const isSurveyReady = computed(() => blocks.value.length > 0)
</script>

<template>
  <div class="survey-builder py-8">
    <div class="mx-auto max-w-[58rem] px-4 xl:px-10">
      <!-- Верхняя панель с навигацией и заголовком -->
      <div class="flex flex-col gap-4 mb-8">
        <!-- Кнопка "Назад" -->
        <RouterLink to="/surveys" class="btn btn-ghost gap-2 w-fit">
          <i class="fa-solid fa-arrow-left"></i>
          Назад
        </RouterLink>

        <!-- Поле ввода названия опроса -->
        <div class="w-full">
          <input
            v-model="surveyTitle"
            placeholder="Введите название опроса..."
            class="input input-bordered w-full text-2xl font-bold h-14 px-4"
            name="survey-title"
            maxlength="255"
          />
        </div>
      </div>

      <!-- Поле ввода описания опроса -->
      <div class="mb-8">
        <textarea
          v-model="surveyDescription"
          placeholder="Добавьте описание опроса..."
          class="textarea textarea-bordered w-full h-32 text-lg px-4 py-3"
          name="survey-description"
        ></textarea>
      </div>

      <!-- Выбор графика -->
      <div class="mb-8">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-lg font-medium">Выберите график практики</span>
          </label>
          <select
            v-model="selectedSchedule"
            class="select select-bordered w-full h-12 text-lg"
            required
          >
            <option value="" disabled>Выберите график...</option>
            <option v-for="schedule in schedules" :key="schedule.id" :value="schedule.id">
              {{ schedule.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Кнопка "Добавить новый блок" -->
      <div class="mb-8">
        <button
          class="btn btn-primary w-full h-14 text-lg gap-2"
          type="button"
          @click="openTypeSelectionModal"
        >
          <i class="fa-solid fa-plus"></i>
          Добавить вопрос
        </button>
      </div>

      <!-- Блоки вопросов -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="blocks space-y-6">
        <div
          v-for="(block, index) in blocks"
          :key="index"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div class="card-body">
            <!-- Заголовок и кнопки управления -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-4">
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold"
                >
                  {{ index + 1 }}
                </div>
                <h3 class="text-xl font-bold">{{ block.question }}</h3>
              </div>
              <div class="flex gap-2">
                <!-- Кнопка "Редактировать" -->
                <button @click="openEditModal(block, index)" class="btn btn-ghost btn-sm">
                  <i class="fa-solid fa-pen-to-square text-base"></i>
                </button>
                <!-- Кнопки перемещения -->
                <div class="flex flex-col gap-1">
                  <button
                    @click="moveQuestionUp(index)"
                    class="btn btn-ghost btn-sm"
                    :disabled="index === 0"
                  >
                    <i class="fa-solid fa-arrow-up text-base"></i>
                  </button>
                  <button
                    @click="moveQuestionDown(index)"
                    class="btn btn-ghost btn-sm"
                    :disabled="index === blocks.length - 1"
                  >
                    <i class="fa-solid fa-arrow-down text-base"></i>
                  </button>
                </div>
                <!-- Кнопка "Удалить" -->
                <button
                  @click="openDeleteConfirmationModal(index)"
                  class="btn btn-ghost btn-sm text-error"
                >
                  <i class="fa-solid fa-trash text-base"></i>
                </button>
              </div>
            </div>

            <!-- Описание вопроса -->
            <div v-if="block.description" class="mb-4 text-base-content/70">
              {{ block.description }}
            </div>

            <!-- Тип вопроса -->
            <div class="badge badge-primary gap-2 text-sm">
              <i class="fa-solid fa-tag"></i>
              {{ block.type }}
            </div>

            <!-- Варианты ответов -->
            <div v-if="block.type === 'Множественный выбор'" class="mt-6">
              <h4 class="text-lg font-semibold mb-4">Варианты ответов:</h4>
              <ul class="space-y-3">
                <li
                  v-for="(option, optionIndex) in block.options"
                  :key="optionIndex"
                  class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                >
                  <div
                    class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {{ optionIndex + 1 }}
                  </div>
                  <span class="text-base">{{ option }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка "Сохранить изменения" -->
      <div class="mt-12">
        <button
          @click="saveSurvey"
          :disabled="!isSurveyReady"
          class="btn btn-primary w-full h-14 text-lg gap-2"
        >
          <i class="fa-solid fa-check"></i>
          Сохранить изменения
        </button>
      </div>
    </div>

    <!-- Модальные окна -->
    <!-- Модальное окно для редактирования вопроса -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <!-- Заголовок -->
        <div class="flex items-center gap-3 mb-6">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-pen-to-square text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Редактировать вопрос</h2>
        </div>

        <!-- Основная форма -->
        <div class="space-y-6">
          <!-- Поле ввода вопроса -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Вопрос</span>
            </label>
            <input
              v-model="editingBlock.question"
              placeholder="Введите текст вопроса..."
              class="input input-bordered w-full h-12 text-lg"
            />
          </div>

          <!-- Поле для описания вопроса -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Описание (необязательно)</span>
            </label>
            <textarea
              v-model="editingBlock.description"
              placeholder="Добавьте дополнительное описание вопроса..."
              class="textarea textarea-bordered w-full h-24 text-base"
            ></textarea>
          </div>

          <!-- Редактирование вариантов ответов для типа "Множественный выбор" -->
          <div v-if="editingBlock.type === 'Множественный выбор'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold">Варианты ответов</h4>
              <button @click="editingBlock.options.push('')" class="btn btn-success btn-sm gap-2">
                <i class="fa-solid fa-plus"></i>
                Добавить вариант
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(option, optionIndex) in editingBlock.options"
                :key="optionIndex"
                class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <div
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {{ optionIndex + 1 }}
                </div>
                <input
                  v-model="editingBlock.options[optionIndex]"
                  placeholder="Введите вариант ответа..."
                  class="input input-bordered flex-1 h-10"
                />
                <button
                  v-if="editingBlock.options.length > 2"
                  @click="editingBlock.options.splice(optionIndex, 1)"
                  class="btn btn-error btn-sm btn-circle"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="modal-action mt-8">
          <button class="btn btn-outline gap-2" @click="closeEditModal">
            <i class="fa-solid fa-times"></i>
            Отмена
          </button>
          <button class="btn btn-primary gap-2" @click="saveEditedBlock">
            <i class="fa-solid fa-check"></i>
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для выбора типа ответа -->
    <div v-if="showTypeSelectionModal" class="modal modal-open">
      <div class="modal-box max-w-md flex flex-col">
        <!-- Заголовок -->
        <div class="flex items-center gap-3 mb-8">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-list-check text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Выберите тип ответа</h2>
        </div>

        <!-- Типы ответов -->
        <div class="flex-1 flex flex-col justify-start space-y-4">
          <!-- Множественный выбор -->
          <button
            class="btn btn-info w-full h-16 text-lg gap-3 hover:scale-[1.02] transition-transform justify-start"
            @click="openQuestionModal('Множественный выбор')"
          >
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-info-content/10">
              <i class="fa-solid fa-list-ul text-info-content"></i>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-semibold">Множественный выбор</span>
              <span class="text-sm opacity-70">Выберите один или несколько вариантов</span>
            </div>
          </button>

          <!-- Текст -->
          <button
            class="btn btn-success w-full h-16 text-lg gap-3 hover:scale-[1.02] transition-transform justify-start"
            @click="openQuestionModal('Текст')"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full bg-success-content/10"
            >
              <i class="fa-solid fa-font text-success-content"></i>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-semibold">Текст</span>
              <span class="text-sm opacity-70">Свободный текстовый ответ</span>
            </div>
          </button>

          <!-- Шкала оценок -->
          <button
            class="btn btn-accent w-full h-16 text-lg gap-3 hover:scale-[1.02] transition-transform justify-start"
            @click="openQuestionModal('Шкала оценок')"
          >
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-accent-content/10">
              <i class="fa-solid fa-sliders text-accent-content"></i>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-semibold">Шкала оценок</span>
              <span class="text-sm opacity-70">Оценка по шкале от 1 до 10</span>
            </div>
          </button>
        </div>

        <!-- Кнопка отмены -->
        <div class="modal-action mt-8">
          <button class="btn btn-outline gap-2" @click="showTypeSelectionModal = false">
            <i class="fa-solid fa-times"></i>
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления вопроса -->
    <div v-if="showQuestionModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <!-- Заголовок -->
        <div class="flex items-center gap-3 mb-6">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-plus text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Добавить вопрос</h2>
        </div>

        <!-- Основная форма -->
        <div class="space-y-6">
          <!-- Поле ввода вопроса -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Вопрос</span>
            </label>
            <input
              v-model="newBlock.question"
              placeholder="Введите текст вопроса..."
              class="input input-bordered w-full h-12 text-lg"
            />
          </div>

          <!-- Поле для описания вопроса -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Описание (необязательно)</span>
            </label>
            <textarea
              v-model="newBlock.description"
              placeholder="Добавьте дополнительное описание вопроса..."
              class="textarea textarea-bordered w-full h-24 text-base"
            ></textarea>
          </div>

          <!-- Для шкалы оценок -->
          <div v-if="selectedBlockType === 'Шкала оценок'" class="alert alert-info">
            <i class="fa-solid fa-info-circle"></i>
            <span>Шкала будет автоматически установлена между 1 и 10.</span>
          </div>

          <!-- Для множественного выбора -->
          <div v-if="selectedBlockType === 'Множественный выбор'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold">Варианты ответов</h4>
              <button @click="addOption" class="btn btn-primary btn-sm gap-2">
                <i class="fa-solid fa-plus"></i>
                Добавить вариант
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(option, index) in newBlock.options"
                :key="index"
                class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <div
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {{ index + 1 }}
                </div>
                <input
                  v-model="newBlock.options[index]"
                  placeholder="Введите вариант ответа..."
                  class="input input-bordered flex-1 h-10"
                />
                <button
                  v-if="newBlock.options.length > 2"
                  @click="removeOption(index)"
                  class="btn btn-error btn-sm btn-circle"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="modal-action mt-8">
          <button class="btn btn-outline gap-2" @click="closeQuestionModal">
            <i class="fa-solid fa-times"></i>
            Отмена
          </button>
          <button class="btn btn-primary gap-2" @click="addBlock">
            <i class="fa-solid fa-check"></i>
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для подтверждения удаления -->
    <div v-if="showDeleteConfirmationModal" class="modal modal-open">
      <div class="modal-box">
        <h2 class="text-xl font-bold mb-4">Предупреждение</h2>
        <p class="mb-4">Вы действительно хотите удалить этот вопрос?</p>
        <div class="modal-action">
          <button @click="cancelDeleteBlock" class="btn btn-outline">Отмена</button>
          <button @click="confirmDeleteBlock" class="btn btn-error">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.survey-builder {
  min-height: calc(100vh - 64px - 88px);
}
</style>

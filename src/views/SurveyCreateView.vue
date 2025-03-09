<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSurveyStore } from '@/stores/useSurveyStore'
import { useScheduleStore } from '@/stores/useScheduleStore'

const surveyStore = useSurveyStore()
const scheduleStore = useScheduleStore()

// Состояния формы
const surveyTitle = ref('')
const surveyDescription = ref('')
const selectedSchedule = ref('')
const responseLimit = ref(null)
const blocks = ref([])

// Состояния модальных окон
const showTypeSelectionModal = ref(false)
const showQuestionModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirmationModal = ref(false)
const selectedBlockType = ref('')
const newBlock = ref({
  type: '',
  question: '',
  description: '',
  options: [],
  scale: { min: 1, max: 10 },
})
const editingBlock = ref(null)
const blockToDeleteIndex = ref(null)
const isTemplateSelected = ref(false)

// Используем schedules из стора вместо заглушки
const schedules = computed(() => scheduleStore.schedules)

// Загрузка расписаний при монтировании
onMounted(async () => {
  await scheduleStore.fetchSchedules()
})

// Функции управления интерфейсом
function selectTemplate() {
  isTemplateSelected.value = true
}

function openTypeSelectionModal() {
  showTypeSelectionModal.value = true
}

function openQuestionModal(type) {
  selectedBlockType.value = type
  newBlock.value.type = type
  showTypeSelectionModal.value = false
  showQuestionModal.value = true

  if (type === 'Множественный выбор') {
    newBlock.value.options = ['', '']
  }
}

function closeQuestionModal() {
  showQuestionModal.value = false
  resetNewBlock()
}

function addBlock() {
  const question = {
    title: newBlock.value.question,
    description: newBlock.value.description,
    order: blocks.value.length + 1,
    question_type: mapQuestionType(newBlock.value.type),
  }

  if (newBlock.value.type === 'Множественный выбор') {
    question.answer_options = newBlock.value.options.map((option, index) => ({
      title: option,
      order: index + 1,
    }))
  }

  blocks.value.push(question)
  closeQuestionModal()
}

function mapQuestionType(type) {
  switch (type) {
    case 'Текст':
      return 'text'
    case 'Шкала оценок':
      return 'scale'
    case 'Множественный выбор':
      return 'multiple_choice'
    default:
      return 'text'
  }
}

async function createSurvey() {
  const surveyData = {
    title: surveyTitle.value,
    description: surveyDescription.value,
    response_limit: responseLimit.value,
    schedule_id: selectedSchedule.value,
    questions: blocks.value.map((block, index) => ({
      ...block,
      order: index + 1,
    })),
  }

  try {
    await surveyStore.createSurvey(surveyData)
    surveyTitle.value = ''
    surveyDescription.value = ''
    selectedSchedule.value = ''
    blocks.value = []
    isTemplateSelected.value = false
    alert('Опрос успешно создан!')
  } catch (error) {
    alert(`Ошибка при создании опроса: ${surveyStore.error}`)
  }
}

function openDeleteConfirmationModal(index) {
  blockToDeleteIndex.value = index
  showDeleteConfirmationModal.value = true
}

function confirmDeleteBlock() {
  if (blockToDeleteIndex.value !== null) {
    blocks.value.splice(blockToDeleteIndex.value, 1)
    blockToDeleteIndex.value = null
    showDeleteConfirmationModal.value = false
  }
}

function cancelDeleteBlock() {
  blockToDeleteIndex.value = null
  showDeleteConfirmationModal.value = false
}

function resetNewBlock() {
  newBlock.value = {
    type: '',
    question: '',
    description: '',
    options: [],
    scale: { min: 1, max: 10 },
  }
}

function addOption() {
  newBlock.value.options.push('')
}

function removeOption(index) {
  newBlock.value.options.splice(index, 1)
}

function moveQuestionUp(index) {
  if (index > 0) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index - 1]
    blocks.value[index - 1] = temp
  }
}

function moveQuestionDown(index) {
  if (index < blocks.value.length - 1) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index + 1]
    blocks.value[index + 1] = temp
  }
}

function openEditModal(block, index) {
  editingBlock.value = {
    ...block,
    index,
    type: mapQuestionTypeToDisplay(block.question_type),
  }
  showEditModal.value = true
}

function mapQuestionTypeToDisplay(type) {
  switch (type) {
    case 'text':
      return 'Текст'
    case 'scale':
      return 'Оценка'
    case 'multiple_choice':
      return 'Множественный выбор'
    default:
      return 'Текст'
  }
}

function saveEditedBlock() {
  if (editingBlock.value !== null) {
    const updatedBlock = {
      title: editingBlock.value.title,
      description: editingBlock.value.description,
      question_type: mapQuestionType(editingBlock.value.type),
      order: editingBlock.value.order,
    }

    if (editingBlock.value.type === 'Множественный выбор') {
      updatedBlock.answer_options = editingBlock.value.answer_options.map((option, index) => ({
        title: option.title,
        order: index + 1,
      }))
    }

    blocks.value[editingBlock.value.index] = updatedBlock
    showEditModal.value = false
    editingBlock.value = null
  }
}

function closeEditModal() {
  showEditModal.value = false
  editingBlock.value = null
}

const isSurveyReady = computed(
  () => blocks.value.length > 0 && surveyTitle.value && selectedSchedule.value,
)

const isLoading = computed(() => surveyStore.loading)
</script>

<template>
  <div class="survey-builder justify-center items-center">
    <!-- Выбор шаблона -->
    <div
      v-if="!isTemplateSelected"
      class="flex flex-col items-center justify-center py-8 transition-all duration-500 ease-in-out"
      style="height: calc(100vh - 64px - 88px)"
    >
      <div class="mx-auto max-w-[58rem] px-4 xl:px-10">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            class="flex h-[140px] flex-grow cursor-pointer flex-col items-center rounded border border-zinc-600/50 px-4 pb-4 shadow pt-2"
            @click="selectTemplate"
          >
            <div class="flex grow items-center">Пустой</div>
            <button class="btn btn-primary w-full mt-4">Начать с нуля</button>
          </div>
          <div
            class="flex h-[140px] flex-grow cursor-pointer flex-col items-center rounded border border-zinc-600/50 px-4 pb-4 shadow border-solid pt-4"
            @click="selectTemplate"
          >
            <div class="flex grow items-center">Обзор продукта</div>
          </div>
          <div
            class="flex h-[140px] flex-grow cursor-pointer flex-col items-center rounded border border-zinc-600/50 px-4 pb-4 shadow border-solid pt-4"
            @click="selectTemplate"
          >
            <div class="flex grow items-center">Отказ от продукта</div>
          </div>
          <div
            class="flex h-[140px] flex-grow flex-col items-center justify-center rounded border border-dashed border-zinc-600/50 p-2 md:col-span-1"
          >
            <div class="mb-2 font-semibold">Больше шаблонов скоро!</div>
            <div>
              Есть предложения?
              <a
                target="_blank"
                class="ml-1 underline"
                href="https://github.com/nurdsaga16/oprosnik/issues/new"
              >
                Создайте запрос
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Форма создания опроса -->
    <div v-if="isTemplateSelected" class="flex-grow py-8">
      <div class="mx-auto max-w-[58rem] px-4 xl:px-10">
        <div class="flex flex-col gap-4 mb-8">
          <button
            class="btn btn-ghost gap-2 w-fit"
            type="button"
            @click="isTemplateSelected = false"
          >
            <i class="fa-solid fa-arrow-left"></i>
            Назад
          </button>
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

        <div class="mb-8">
          <textarea
            v-model="surveyDescription"
            placeholder="Добавьте описание опроса..."
            class="textarea textarea-bordered w-full h-32 text-lg px-4 py-3"
            name="survey-description"
          ></textarea>
        </div>

        <div class="mb-8">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Лимит ответов</span>
              <span class="label-text-alt text-base-content/50 text-sm whitespace-normal"
                >(Оставьте пустым, чтобы не ставить ограничение (Не больше 255))</span
              >
            </label>
            <input
              v-model.number="responseLimit"
              type="number"
              min="1"
              class="input input-bordered w-full h-12 text-lg"
            />
          </div>
        </div>

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
                {{ schedule.practice?.title }} - {{ schedule.group?.title }}
              </option>
            </select>
          </div>
        </div>

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

        <div class="blocks space-y-6">
          <div
            v-for="(block, index) in blocks"
            :key="index"
            class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="card-body">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold"
                  >
                    {{ index + 1 }}
                  </div>
                  <h3 class="text-xl font-bold">{{ block.title }}</h3>
                </div>
                <div class="flex gap-2">
                  <button @click="openEditModal(block, index)" class="btn btn-ghost btn-sm">
                    <i class="fa-solid fa-pen-to-square text-base"></i>
                  </button>
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
                  <button
                    @click="openDeleteConfirmationModal(index)"
                    class="btn btn-ghost btn-sm text-error"
                  >
                    <i class="fa-solid fa-trash text-base"></i>
                  </button>
                </div>
              </div>

              <div v-if="block.description" class="mb-4 text-base-content/70">
                {{ block.description }}
              </div>

              <div class="badge badge-primary gap-2 text-sm">
                <i class="fa-solid fa-tag"></i>
                {{ mapQuestionTypeToDisplay(block.question_type) }}
              </div>

              <div v-if="block.question_type === 'multiple_choice'" class="mt-6">
                <h4 class="text-lg font-semibold mb-4">Варианты ответов:</h4>
                <ul class="space-y-3">
                  <li
                    v-for="(option, optionIndex) in block.answer_options"
                    :key="optionIndex"
                    class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                  >
                    <div
                      class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {{ option.order }}
                    </div>
                    <span class="text-base">{{ option.title }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <button
            @click="createSurvey"
            :disabled="!isSurveyReady || isLoading"
            class="btn btn-primary w-full h-14 text-lg gap-2"
          >
            <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-check"></i>
            {{ isLoading ? 'Создание...' : 'Создать опрос' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-pen-to-square text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Редактировать вопрос</h2>
        </div>

        <div class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Вопрос</span>
            </label>
            <input
              v-model="editingBlock.title"
              placeholder="Введите текст вопроса..."
              class="input input-bordered w-full h-12 text-lg"
            />
          </div>

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

          <div v-if="editingBlock.type === 'Множественный выбор'" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold">Варианты ответов</h4>
              <button
                @click="
                  editingBlock.answer_options.push({
                    title: '',
                    order: editingBlock.answer_options.length + 1,
                  })
                "
                class="btn btn-success btn-sm gap-2"
              >
                <i class="fa-solid fa-plus"></i>
                Добавить вариант
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(option, optionIndex) in editingBlock.answer_options"
                :key="optionIndex"
                class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <div
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {{ option.order }}
                </div>
                <input
                  v-model="editingBlock.answer_options[optionIndex].title"
                  placeholder="Введите вариант ответа..."
                  class="input input-bordered flex-1 h-10"
                />
                <button
                  v-if="editingBlock.answer_options.length > 2"
                  @click="editingBlock.answer_options.splice(optionIndex, 1)"
                  class="btn btn-error btn-sm btn-circle"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

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

    <!-- Модальное окно выбора типа -->
    <div v-if="showTypeSelectionModal" class="modal modal-open">
      <div class="modal-box max-w-md flex flex-col">
        <div class="flex items-center gap-3 mb-8">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-list-check text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Выберите тип ответа</h2>
        </div>

        <div class="flex-1 flex flex-col justify-start space-y-4">
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

        <div class="modal-action mt-8">
          <button class="btn btn-outline gap-2" @click="showTypeSelectionModal = false">
            <i class="fa-solid fa-times"></i>
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления вопроса -->
    <div v-if="showQuestionModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
          >
            <i class="fa-solid fa-plus text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold">Добавить вопрос</h2>
        </div>

        <div class="space-y-6">
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

          <div v-if="selectedBlockType === 'Шкала оценок'" class="alert alert-info">
            <i class="fa-solid fa-info-circle"></i>
            <span>Шкала будет автоматически установлена между 1 и 10.</span>
          </div>

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

    <!-- Модальное окно подтверждения удаления -->
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
/* Стили можно добавить по необходимости */
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/useSurveyStore'
import { useScheduleStore } from '@/stores/useScheduleStore'

const router = useRouter()
const route = useRoute()
const surveyStore = useSurveyStore()
const scheduleStore = useScheduleStore()

// Состояния формы
const surveyTitle = ref('')
const surveyDescription = ref('')
const selectedSchedule = ref('')
const responseLimit = ref(null)
const blocks = ref([]) // Локальные изменения
const originalBlocks = ref([]) // Исходное состояние с сервера

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

// ID опроса из маршрута
const surveyId = route.params.id

// Данные из сторов
const schedules = computed(() => scheduleStore.schedules)
const schedulesLoading = computed(() => scheduleStore.loading)
const schedulesError = computed(() => scheduleStore.error)

// Загрузка данных при монтировании
onMounted(async () => {
  if (!surveyId) {
    console.error('ID опроса отсутствует')
    router.push('/surveys')
    return
  }

  try {
    console.log(`Загрузка данных для опроса с ID: ${surveyId}`)
    await Promise.all([surveyStore.fetchSurvey(surveyId), scheduleStore.fetchSchedules()])

    const surveyData = surveyStore.currentSurvey
    console.log('Полученные данные опроса:', surveyData)

    if (surveyData) {
      surveyTitle.value = surveyData.title || ''
      surveyDescription.value = surveyData.description || ''
      responseLimit.value = surveyData.response_limit || null
      selectedSchedule.value = surveyData.schedule?.id || ''
      const questions = surveyData.questions
        ? surveyData.questions.map((question) => ({
            id: question.id,
            title: question.title,
            description: question.description || '',
            order: question.order,
            question_type: question.question_type,
            answer_options: question.answer_options
              ? question.answer_options.map((option) => ({
                  id: option.id,
                  title: option.title,
                  order: option.order,
                }))
              : [],
          }))
        : []
      blocks.value = JSON.parse(JSON.stringify(questions))
      originalBlocks.value = JSON.parse(JSON.stringify(questions))
    } else {
      throw new Error('Данные опроса не получены')
    }

    const scheduleExists = schedules.value.some((s) => s.id === selectedSchedule.value)
    if (!scheduleExists) {
      console.warn(`График с ID ${selectedSchedule.value} не найден в списке расписаний`)
    }
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err)
    router.push('/surveys')
  }
})

// Функции управления интерфейсом
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
  const block = {
    id: null,
    title: newBlock.value.question,
    description: newBlock.value.description,
    order: blocks.value.length + 1,
    question_type: mapQuestionType(newBlock.value.type),
    answer_options:
      newBlock.value.type === 'Множественный выбор'
        ? newBlock.value.options.map((option, index) => ({
            id: null,
            title: option,
            order: index + 1,
          }))
        : [],
  }
  blocks.value.push(block)
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

async function saveSurvey() {
  const surveyData = {
    title: surveyTitle.value,
    description: surveyDescription.value,
    response_limit: responseLimit.value,
    schedule_id: selectedSchedule.value,
  }

  try {
    console.log('Обновление опроса:', surveyData)
    await surveyStore.updateSurvey(surveyId, surveyData)

    // Удаление вопросов, которые были удалены локально
    const deletedBlocks = originalBlocks.value.filter(
      (ob) => !blocks.value.some((b) => b.id === ob.id && ob.id !== null),
    )
    for (const deletedBlock of deletedBlocks) {
      console.log('Удаление вопроса:', deletedBlock.id)
      await surveyStore.deleteQuestion(deletedBlock.id)
    }

    // Синхронизация вопросов и вариантов ответа
    for (let i = 0; i < blocks.value.length; i++) {
      const block = blocks.value[i]
      const originalBlock = originalBlocks.value.find((b) => b.id === block.id) || {}

      // Создание нового вопроса
      if (!block.id) {
        const questionData = {
          survey_id: surveyId,
          title: block.title,
          description: block.description,
          order: block.order,
          question_type: block.question_type,
        }
        console.log('Создание нового вопроса:', questionData)
        const createdQuestion = await surveyStore.createQuestion(questionData)
        block.id = createdQuestion.id

        if (block.question_type === 'multiple_choice') {
          block.answer_options = await Promise.all(
            block.answer_options.map(async (option, index) => {
              const optionData = {
                question_id: block.id,
                title: option.title,
                order: option.order || index + 1,
              }
              console.log('Создание нового варианта:', optionData)
              const createdOption = await surveyStore.createAnswerOption(optionData)
              return {
                id: createdOption.id,
                title: createdOption.title,
                order: createdOption.order,
              }
            }),
          )
        }
      } else {
        // Проверка изменений вопроса
        const questionChanged =
          block.title !== originalBlock.title ||
          block.description !== originalBlock.description ||
          block.order !== originalBlock.order ||
          block.question_type !== originalBlock.question_type

        if (questionChanged) {
          const updatedQuestionData = {
            survey_id: surveyId,
            title: block.title,
            description: block.description,
            order: block.order,
            question_type: block.question_type,
          }
          console.log('Обновление вопроса:', updatedQuestionData)
          await surveyStore.updateQuestion(block.id, updatedQuestionData)
        } else {
          console.log(`Вопрос с ID ${block.id} не изменился`)
        }

        // Обработка вариантов ответа для multiple_choice
        if (block.question_type === 'multiple_choice') {
          const existingOptions = block.answer_options.filter((opt) => opt.id)
          const newOptions = block.answer_options.filter((opt) => !opt.id)

          // Удаление вариантов ответа, которые были удалены локально
          const deletedOptions =
            originalBlock.answer_options?.filter(
              (oo) => !existingOptions.some((eo) => eo.id === oo.id),
            ) || []
          for (const deletedOption of deletedOptions) {
            console.log('Удаление варианта ответа:', deletedOption.id)
            await surveyStore.deleteAnswerOption(deletedOption.id)
          }

          // Обновление существующих вариантов
          for (const option of existingOptions) {
            const originalOption = originalBlock.answer_options?.find((o) => o.id === option.id)
            if (!originalOption) {
              console.warn(`Исходный вариант с ID ${option.id} не найден`)
              continue
            }
            if (option.title !== originalOption.title || option.order !== originalOption.order) {
              console.log('Обновление варианта:', {
                id: option.id,
                title: option.title,
                order: option.order,
              })
              await surveyStore.updateAnswerOption(option.id, {
                title: option.title,
                order: option.order,
              })
            } else {
              console.log(`Вариант с ID ${option.id} не изменился`)
            }
          }

          // Создание новых вариантов
          for (const option of newOptions) {
            const optionData = {
              question_id: block.id,
              title: option.title,
              order: option.order,
            }
            console.log('Создание нового варианта:', optionData)
            const createdOption = await surveyStore.createAnswerOption(optionData)
            option.id = createdOption.id
            option.title = createdOption.title
            option.order = createdOption.order
          }
        }
      }
    }

    // Обновляем исходное состояние после успешного сохранения
    originalBlocks.value = JSON.parse(JSON.stringify(blocks.value))
    router.push(`/survey/answer/${surveyId}`)
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
    alert(`Ошибка при обновлении опроса: ${surveyStore.error || error.message}`)
  }
}

function openDeleteConfirmationModal(index) {
  blockToDeleteIndex.value = index
  showDeleteConfirmationModal.value = true
}

function confirmDeleteBlock() {
  if (blockToDeleteIndex.value !== null) {
    blocks.value.splice(blockToDeleteIndex.value, 1)
    // Пересчитываем order для оставшихся вопросов
    blocks.value.forEach((block, index) => {
      block.order = index + 1
    })
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
    blocks.value[index].order = index + 1
    blocks.value[index - 1].order = index
  }
}

function moveQuestionDown(index) {
  if (index < blocks.value.length - 1) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index + 1]
    blocks.value[index + 1] = temp
    blocks.value[index].order = index + 1
    blocks.value[index + 1].order = index + 2
  }
}

function mapQuestionTypeToDisplay(type) {
  switch (type) {
    case 'text':
      return 'Текст'
    case 'scale':
      return 'Шкала оценок'
    case 'multiple_choice':
      return 'Множественный выбор'
    default:
      return 'Текст'
  }
}

const originalEditingBlock = ref(null)

function openEditModal(block, index) {
  originalEditingBlock.value = JSON.parse(JSON.stringify(block))
  editingBlock.value = {
    ...block,
    index,
    type: mapQuestionTypeToDisplay(block.question_type),
  }
  showEditModal.value = true
}

function saveEditedBlock() {
  if (!editingBlock.value) {
    console.warn('editingBlock.value is null or undefined')
    return
  }

  const currentBlock = { ...editingBlock.value }
  const newBlock = {
    id: currentBlock.id,
    title: currentBlock.title,
    description: currentBlock.description,
    order: currentBlock.order,
    question_type: mapQuestionType(currentBlock.type),
    answer_options:
      currentBlock.type === 'Множественный выбор'
        ? currentBlock.answer_options.map((opt, index) => ({
            id: opt.id,
            title: opt.title,
            order: index + 1, // Пересчитываем order локально
          }))
        : currentBlock.answer_options || [],
  }
  blocks.value[currentBlock.index] = newBlock
  showEditModal.value = false
  editingBlock.value = null
  originalEditingBlock.value = null
}

function closeEditModal() {
  showEditModal.value = false
  editingBlock.value = null
}

const isSurveyReady = computed(
  () => blocks.value.length > 0 && surveyTitle.value && selectedSchedule.value,
)

const isLoading = computed(() => surveyStore.loading || scheduleStore.loading)
</script>

<template>
  <div class="survey-builder justify-center items-center py-8">
    <div class="mx-auto max-w-[58rem] px-4 xl:px-10">
      <!-- Заголовок и навигация -->
      <div class="flex flex-col gap-4 mb-8">
        <button class="btn btn-ghost gap-2 w-fit" @click="router.push('/surveys')">
          <i class="fa-solid fa-arrow-left"></i>
          Назад
        </button>
        <h1 class="text-2xl font-bold">Редактирование опроса</h1>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="min-h-[60vh] flex flex-col items-center justify-center">
        <div class="relative">
          <!-- Основной спиннер -->
          <div
            class="w-16 h-16 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"
          >
            <div
              class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-[spin_1.5s_ease-in-out_infinite]"
            ></div>
          </div>

          <!-- Пульсирующие круги -->
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite]">
            <div class="w-16 h-16 rounded-full bg-primary/10"></div>
          </div>
          <div class="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite_0.5s]">
            <div class="w-16 h-16 rounded-full bg-primary/5"></div>
          </div>
        </div>

        <!-- Текст загрузки с анимацией -->
        <div class="mt-8 text-lg font-medium text-base-content/70">
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite]">З</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.1s]">а</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.2s]">г</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.3s]">р</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.4s]">у</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.5s]">з</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.6s]">к</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.7s]">а</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.8s]">.</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_0.9s]">.</span>
          <span class="inline-block animate-[bounce_1s_ease-in-out_infinite_1s]">.</span>
        </div>

        <!-- Дополнительный текст -->
        <p class="mt-2 text-sm text-base-content/50">Пожалуйста, подождите</p>
      </div>

      <!-- Форма редактирования -->
      <div v-else>
        <div class="w-full mb-4">
          <input
            v-model="surveyTitle"
            placeholder="Введите название опроса..."
            class="input input-bordered w-full text-2xl font-bold h-14 px-4"
            maxlength="255"
          />
        </div>

        <div class="mb-8">
          <textarea
            v-model="surveyDescription"
            placeholder="Добавьте описание опроса..."
            class="textarea textarea-bordered w-full h-32 text-lg px-4 py-3"
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
              :disabled="schedulesLoading || schedulesError"
            >
              <option value="" disabled>Выберите график...</option>
              <option v-for="schedule in schedules" :key="schedule.id" :value="schedule.id">
                {{ schedule.practice?.title }} - {{ schedule.group?.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-8">
          <button class="btn btn-primary w-full h-14 text-lg gap-2" @click="openTypeSelectionModal">
            <i class="fa-solid fa-plus"></i>
            Добавить вопрос
          </button>
        </div>

        <!-- Список вопросов -->
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

        <!-- Кнопка сохранения -->
        <div class="mt-12">
          <button
            @click="saveSurvey"
            :disabled="!isSurveyReady || isLoading"
            class="btn btn-primary w-full h-14 text-lg gap-2"
          >
            <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-check"></i>
            {{ isLoading ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </div>

      <!-- Модальное окно редактирования вопроса -->
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
                      id: null,
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
                    {{ optionIndex + 1 }}
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
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full bg-accent-content/10"
              >
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
  </div>
</template>

<style scoped>
.survey-builder {
  min-height: calc(100vh - 64px - 88px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>

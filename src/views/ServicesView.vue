<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  checkResultExam,
  generateTask,
  getAllGrades,
  getAllSections,
  getTasksBySection,
  type GradeDto,
  type GeneratedTaskResponse,
  type SectionDto,
  type TaskDto,
} from '../services/tasks'

type Section = 'class' | 'lesson' | 'task'

const activeSection = ref<Section>('class')
const grades = ref<GradeDto[]>([])
const selectedGrade = ref<GradeDto | null>(null)
const sectionsByGrade = ref<Record<string, SectionDto[]>>({})
const selectedSection = ref<SectionDto | null>(null)
const tasksBySection = ref<Record<string, TaskDto[]>>({})
const selectedTaskTemplate = ref<TaskDto | null>(null)
const selectedGeneratedTask = ref<{ id: string } | null>(null)
const loadingGrades = ref(false)
const errorMessage = ref<string | null>(null)
const loadingSections = ref(false)
const sectionsErrorMessage = ref<string | null>(null)
const loadingTasks = ref(false)
const tasksErrorMessage = ref<string | null>(null)
const taskCount = ref(1)
const generatedTask = ref<GeneratedTaskResponse | null>(null)
const taskErrorMessage = ref<string | null>(null)
const submitErrorMessage = ref<string | null>(null)
const submitResult = ref<unknown>(null)
const checkResult = ref<{
  task?: string
  options?: Record<string, string>
  answer?: string
  hint?: string
  solution?: string
  result?: boolean
} | null>(null)
const selectedAnswers = ref<Record<string, string>>({})
const activeTaskId = ref<string | null>(null)

const lessonEnabled = computed(() => selectedGrade.value !== null)
const taskEnabled = computed(() => selectedSection.value !== null)
const gradeName = computed(() => selectedGrade.value?.key ?? '')
const sectionId = computed(() => selectedSection.value?.id ?? '')

const loadGrades = async (): Promise<void> => {
  loadingGrades.value = true
  errorMessage.value = null
  try {
    grades.value = await getAllGrades()
  } catch {
    grades.value = []
    errorMessage.value = 'Неуспешно зареждане на класовете.'
  } finally {
    loadingGrades.value = false
  }
}

const setActiveSection = (next: Section): void => {
  if (next === 'lesson' && !lessonEnabled.value) {
    return
  }
  if (next === 'task' && !taskEnabled.value) {
    return
  }
  activeSection.value = next
  if (next === 'lesson') {
    void loadSections()
  }
  if (next === 'task') {
    void loadTasks()
  }
}

const selectGrade = (grade: GradeDto): void => {
  selectedGrade.value = grade
  selectedSection.value = null
  selectedTaskTemplate.value = null
  selectedGeneratedTask.value = null
  activeSection.value = 'class'
  generatedTask.value = null
  selectedAnswers.value = {}
  activeTaskId.value = null
  submitResult.value = null
  checkResult.value = null
  submitErrorMessage.value = null
}

const loadSections = async (): Promise<void> => {
  const currentGrade = gradeName.value
  if (!currentGrade) {
    return
  }
  if (sectionsByGrade.value[currentGrade]) {
    return
  }
  loadingSections.value = true
  sectionsErrorMessage.value = null
  try {
    const sections = await getAllSections(currentGrade)
    sectionsByGrade.value = { ...sectionsByGrade.value, [currentGrade]: sections }
  } catch {
    sectionsErrorMessage.value = 'Неуспешно зареждане на уроците.'
  } finally {
    loadingSections.value = false
  }
}

const selectSection = (section: SectionDto): void => {
  selectedSection.value = section
  selectedTaskTemplate.value = null
  selectedGeneratedTask.value = null
  generatedTask.value = null
  selectedAnswers.value = {}
  activeTaskId.value = null
  submitResult.value = null
  checkResult.value = null
  submitErrorMessage.value = null
}

const loadTasks = async (): Promise<void> => {
  const currentSection = sectionId.value
  if (!currentSection) {
    return
  }
  if (tasksBySection.value[currentSection]) {
    return
  }
  loadingTasks.value = true
  tasksErrorMessage.value = null
  try {
    const tasks = await getTasksBySection(currentSection)
    tasksBySection.value = { ...tasksBySection.value, [currentSection]: tasks }
  } catch {
    tasksErrorMessage.value = 'Неуспешно зареждане на задачите.'
  } finally {
    loadingTasks.value = false
  }
}

const selectTaskTemplate = (task: TaskDto): void => {
  selectedTaskTemplate.value = task
  checkResult.value = null
}

const handleGenerate = async (): Promise<void> => {
  if (!selectedTaskTemplate.value?.id) {
    taskErrorMessage.value = 'Липсва избрана задача.'
    return
  }
  taskErrorMessage.value = null
  submitErrorMessage.value = null
  submitResult.value = null
  checkResult.value = null
  selectedAnswers.value = {}
  activeTaskId.value = null
  selectedGeneratedTask.value = null
  try {
    generatedTask.value = await generateTask({
      taskId: selectedTaskTemplate.value.id,
      count: Math.max(1, Number(taskCount.value) || 1),
      students: [],
    })
  } catch {
    taskErrorMessage.value = 'Неуспешно генериране на задачи.'
  }
}

const selectAnswer = (taskId: string, optionKey: string): void => {
  selectedAnswers.value = { ...selectedAnswers.value, [taskId]: optionKey }
  selectedGeneratedTask.value = { id: taskId }
  activeTaskId.value = generatedTask.value?.id || null
}

const submitAnswer = async (): Promise<void> => {
  if (!generatedTask.value) {
    return
  }
  const currentTaskId = selectedGeneratedTask.value?.id
    ?? generatedTask.value.tasks?.[0]?.id
    ?? null
  if (!currentTaskId) {
    submitErrorMessage.value = 'Липсва идентификатор на задача.'
    return
  }
  const answer = selectedAnswers.value[currentTaskId]
  if (!answer) {
    return
  }
  const shortExamId = activeTaskId.value
  if (!shortExamId) {
    submitErrorMessage.value = 'Липсва examId.'
    return
  }
  submitErrorMessage.value = null
  checkResult.value = null
  try {
    const result = await checkResultExam(currentTaskId, shortExamId, answer)
    submitResult.value = result
    checkResult.value = result as {
      task?: string
      options?: Record<string, string>
      answer?: string
      hint?: string
      solution?: string
      result?: boolean
    }
  } catch {
    submitErrorMessage.value = 'Неуспешно изпращане на отговор.'
  }
}

onMounted(async () => {
  await loadGrades()
})
</script>

<template>
  <div class="services-page">
    <aside class="services-sidebar">
      <h2 class="services-sidebar__title">Навигация</h2>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'class' }"
        @click="setActiveSection('class')"
      >
        Клас
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'lesson' }"
        :disabled="!lessonEnabled"
        @click="setActiveSection('lesson')"
      >
        Урок
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'task' }"
        :disabled="!taskEnabled"
        @click="setActiveSection('task')"
      >
        Задача
      </button>
    </aside>

    <section class="services-content">
      <div class="services-content__header">
        <button type="button" class="services-nav__button">Математика</button>
      </div>
      <h1 class="services-title">
        {{ activeSection === 'class' ? 'Клас' : activeSection === 'lesson' ? 'Урок' : 'Задача' }}
      </h1>
      <p class="services-subtitle">Available offerings will appear here.</p>

      <div v-if="activeSection === 'class'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Избери клас</h2>
          <span v-if="loadingGrades" class="services-card__status">Зареждане...</span>
        </div>
        <p v-if="errorMessage" class="services-card__error">{{ errorMessage }}</p>
        <div v-else class="services-grade-list">
          <button
            v-for="grade in grades"
            :key="grade.key"
            type="button"
            class="services-grade"
            :class="{ 'is-selected': selectedGrade?.key === grade.key }"
            @click="selectGrade(grade)"
          >
            {{ grade.level ?? grade.label }}
          </button>
        </div>
      </div>

      <div v-if="selectedGrade" class="services-card services-card--compact">
        <p class="services-card__label">Избран клас: {{ selectedGrade.desc || selectedGrade.label }}</p>
      </div>

      <div v-if="activeSection === 'lesson'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Избери урок</h2>
          <span v-if="loadingSections" class="services-card__status">Зареждане...</span>
        </div>
        <p v-if="sectionsErrorMessage" class="services-card__error">{{ sectionsErrorMessage }}</p>
        <div v-else class="services-section-list">
          <button
            v-for="section in sectionsByGrade[gradeName] || []"
            :key="section.id"
            type="button"
            class="services-section"
            :class="{ 'is-selected': selectedSection?.id === section.id }"
            @click="selectSection(section)"
          >
            {{ section.sectionName }}
          </button>
        </div>
      </div>

      <div v-if="selectedSection" class="services-card services-card--compact">
        <p class="services-card__label">Избран урок: {{ selectedSection.sectionName }}</p>
      </div>

      <div v-if="activeSection === 'task'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Генериране</h2>
        </div>
        <div class="services-task-picker">
          <div class="services-task-picker__header">
            <span class="services-card__label">Избери задача</span>
            <span v-if="loadingTasks" class="services-card__status">Зареждане...</span>
          </div>
          <p v-if="tasksErrorMessage" class="services-card__error">{{ tasksErrorMessage }}</p>
          <div v-else class="services-task-picker__list">
            <button
              v-for="task in tasksBySection[sectionId] || []"
              :key="task.id"
              type="button"
              class="services-task-picker__item"
              :class="{ 'is-selected': selectedTaskTemplate?.id === task.id }"
              @click="selectTaskTemplate(task)"
            >
              {{ task.taskName }}
            </button>
          </div>
        </div>
        <div class="services-task-controls">
          <label class="services-task-controls__field">
            <span>Брой</span>
            <input v-model.number="taskCount" type="number" min="1" />
          </label>
          <button
            type="button"
            class="services-task-controls__button"
            :disabled="!selectedTaskTemplate"
            @click="handleGenerate"
          >
            Генерирай
          </button>
        </div>
        <p v-if="taskErrorMessage" class="services-card__error">{{ taskErrorMessage }}</p>

        <div v-if="generatedTask" class="services-task-result">
          <div class="services-task-meta">
            <p v-if="generatedTask.section?.sectionName" class="services-card__label">
              Раздел: {{ generatedTask.section.sectionName }}
            </p>
            <p v-if="generatedTask.taskSection?.taskName" class="services-card__label">
              Задача: {{ generatedTask.taskSection.taskName }}
            </p>
          </div>

          <div v-if="generatedTask.tasks?.length" class="services-task-list">
            <article v-for="task in generatedTask.tasks" :key="task.id" class="services-task">
              <p class="services-task__text">{{ task.task }}</p>
              <div class="services-task__options">
                <label
                  v-for="(optionValue, optionKey) in task.options"
                  :key="optionKey"
                  class="services-task__option"
                  :class="{ 'is-selected': task.id && selectedAnswers[task.id] === optionKey }"
                >
                  <input
                    type="radio"
                    :name="`task-${task.id}`"
                    :value="optionKey"
                    :checked="selectedAnswers[task.id || ''] === optionKey"
                    @change="task.id && selectAnswer(task.id, optionKey)"
                  />
                  <span>{{ optionKey }}: {{ optionValue }}</span>
                </label>
              </div>
              <p v-if="task.hint" class="services-task__hint">
                <span class="services-task__hint-label">Указание:</span>
                {{ task.hint }}
              </p>
            </article>
          </div>
        </div>

        <div class="services-task-submit">
          <button
            type="button"
            class="services-task-submit__button"
            :disabled="!selectedGeneratedTask?.id || !selectedAnswers[selectedGeneratedTask.id]"
            @click="submitAnswer"
          >
            Изпрати отговор
          </button>
          <p v-if="submitErrorMessage" class="services-card__error">{{ submitErrorMessage }}</p>
        </div>
      </div>

      <div v-if="checkResult" class="services-card services-card--result">
        <div class="services-result__status" :class="{ 'is-correct': checkResult.result }">
          {{ checkResult.result ? 'ВЯРНО' : 'ГРЕШНО' }}
        </div>
        <div class="services-result__details">
          <p><strong>Задача:</strong> {{ checkResult.task }}</p>
          <p><strong>Избран отговор:</strong> {{ checkResult.answer }}</p>
          <div v-if="checkResult.options" class="services-result__options">
            <strong>Възможни отговори:</strong>
            <ul>
              <li v-for="(value, key) in checkResult.options" :key="key">{{ key }}: {{ value }}</li>
            </ul>
          </div>
          <p v-if="checkResult.hint"><strong>Помощ:</strong> {{ checkResult.hint }}</p>
          <p v-if="checkResult.solution"><strong>Решение:</strong> {{ checkResult.solution }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

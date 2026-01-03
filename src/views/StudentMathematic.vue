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
import ServicesSidebar from '../components/services/ServicesSidebar.vue'
import GradePickerCard from '../components/services/GradePickerCard.vue'
import SectionPickerCard from '../components/services/SectionPickerCard.vue'
import TaskTemplatePickerCard from '../components/services/TaskTemplatePickerCard.vue'
import TaskGenerateCard from '../components/services/TaskGenerateCard.vue'
import GeneratedTaskCard from '../components/services/GeneratedTaskCard.vue'
import CheckResultCard from '../components/services/CheckResultCard.vue'

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
const resultByTaskId = ref<Record<string, {
  task?: string
  options?: Record<string, string>
  answer?: string
  hint?: string
  solution?: string
  result?: boolean
}>>({})
const lockedTaskIds = ref<Record<string, boolean>>({})
const lastResultTaskId = ref<string | null>(null)
const selectedAnswers = ref<Record<string, string>>({})
const activeTaskId = ref<string | null>(null)
const isSubmitting = ref(false)

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
  resultByTaskId.value = {}
  lockedTaskIds.value = {}
  lastResultTaskId.value = null
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
  resultByTaskId.value = {}
  lockedTaskIds.value = {}
  lastResultTaskId.value = null
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
  resultByTaskId.value = {}
  lockedTaskIds.value = {}
  lastResultTaskId.value = null
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
  if (lockedTaskIds.value[taskId] || isSubmitting.value) {
    return
  }
  selectedAnswers.value = { ...selectedAnswers.value, [taskId]: optionKey }
  selectedGeneratedTask.value = { id: taskId }
  const generated = generatedTask.value as { id?: string } | null
  activeTaskId.value = generated?.id ?? null
}

const updateTaskCount = (value: number): void => {
  taskCount.value = value
}

const buildCorrectAnswer = (result: {
  result?: boolean
  solution?: string
}, selectedAnswer: string): string => {
  if (result.result === true) {
    return selectedAnswer
  }
  const solution = result.solution || ''
  const match = solution.match(/(^|\s)(А|Б|В|Г)(\s|$)/)
  if (match && match[2]) {
    return match[2]
  }
  return 'Виж Решение'
}

const retryCheck = (): void => {
  const taskId = lastResultTaskId.value
  if (!taskId) {
    return
  }
  const nextResults = { ...resultByTaskId.value }
  delete nextResults[taskId]
  resultByTaskId.value = nextResults
  const nextLocks = { ...lockedTaskIds.value }
  delete nextLocks[taskId]
  lockedTaskIds.value = nextLocks
  lastResultTaskId.value = null
  checkResult.value = null
  submitErrorMessage.value = null
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
  if (lockedTaskIds.value[currentTaskId] || isSubmitting.value) {
    return
  }
  submitErrorMessage.value = null
  checkResult.value = null
  isSubmitting.value = true
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
    resultByTaskId.value = { ...resultByTaskId.value, [currentTaskId]: checkResult.value }
    lockedTaskIds.value = { ...lockedTaskIds.value, [currentTaskId]: true }
    lastResultTaskId.value = currentTaskId
  } catch {
    submitErrorMessage.value = 'Неуспешно изпращане на отговор.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadGrades()
})
</script>

<template>
  <div class="services-page">
    <ServicesSidebar
      :active-section="activeSection"
      :lesson-enabled="lessonEnabled"
      :task-enabled="taskEnabled"
      @select="setActiveSection"
    />

    <section class="services-content">
      <h1 class="services-title">
        {{ activeSection === 'class' ? 'Клас' : activeSection === 'lesson' ? 'Урок' : 'Задача' }}
      </h1>
      <p class="services-subtitle">Available offerings will appear here.</p>

      <GradePickerCard
        v-if="activeSection === 'class'"
        :grades="grades"
        :selected-grade-key="selectedGrade?.key ?? null"
        :loading="loadingGrades"
        :error-message="errorMessage"
        @select="selectGrade"
      />

      <div v-if="selectedGrade" class="services-card services-card--compact">
        <p class="services-card__label">Избран клас: {{ selectedGrade.desc || selectedGrade.label }}</p>
      </div>

      <SectionPickerCard
        v-if="activeSection === 'lesson'"
        :sections="sectionsByGrade[gradeName] || []"
        :selected-section-id="selectedSection?.id ?? null"
        :loading="loadingSections"
        :error-message="sectionsErrorMessage"
        @select="selectSection"
      />

      <div v-if="selectedSection" class="services-card services-card--compact">
        <p class="services-card__label">Избран урок: {{ selectedSection.sectionName }}</p>
      </div>

      <div v-if="activeSection === 'task'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Генериране</h2>
        </div>
        <TaskTemplatePickerCard
          :tasks="tasksBySection[sectionId] || []"
          :selected-task-id="selectedTaskTemplate?.id ?? null"
          :loading="loadingTasks"
          :error-message="tasksErrorMessage"
          @select="selectTaskTemplate"
        />
        <TaskGenerateCard
          :count="taskCount"
          :can-generate="Boolean(selectedTaskTemplate)"
          :error-message="taskErrorMessage"
          @update:count="updateTaskCount"
          @generate="handleGenerate"
        />

        <GeneratedTaskCard
          v-if="generatedTask"
          :generated-task="generatedTask"
          :selected-answers="selectedAnswers"
          :locked-task-ids="lockedTaskIds"
          :is-submitting="isSubmitting"
          @select-answer="selectAnswer"
        />

        <div class="services-task-submit">
          <button
            type="button"
            class="services-task-submit__button"
            :disabled="!selectedGeneratedTask?.id || !selectedAnswers[selectedGeneratedTask.id] || lockedTaskIds[selectedGeneratedTask.id] || isSubmitting"
            @click="submitAnswer"
          >
            Изпрати отговор
          </button>
          <p v-if="submitErrorMessage" class="services-card__error">{{ submitErrorMessage }}</p>
        </div>
      </div>

      <CheckResultCard
        v-if="checkResult"
        :result="checkResult"
        :correct-answer="buildCorrectAnswer(checkResult, selectedAnswers[lastResultTaskId || ''] || '')"
        :show-retry="Boolean(lastResultTaskId)"
        @retry="retryCheck"
      />
    </section>
  </div>
</template>

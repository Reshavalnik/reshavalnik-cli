import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { GradeDto, GeneratedTaskResponse, SectionDto, TaskDto } from '../services/tasks'

type Section = 'class' | 'lesson' | 'task'

export const useStudentMathematicsStore = defineStore('studentMathematics', () => {
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

  const hasResult = computed(() => checkResult.value !== null)

  const reset = (): void => {
    activeSection.value = 'class'
    selectedGrade.value = null
    selectedSection.value = null
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
    taskCount.value = 1
    sectionsByGrade.value = {}
    tasksBySection.value = {}
    errorMessage.value = null
    sectionsErrorMessage.value = null
    tasksErrorMessage.value = null
    taskErrorMessage.value = null
    submitErrorMessage.value = null
    loadingSections.value = false
    loadingTasks.value = false
    isSubmitting.value = false
  }

  return {
    activeSection,
    grades,
    selectedGrade,
    sectionsByGrade,
    selectedSection,
    tasksBySection,
    selectedTaskTemplate,
    selectedGeneratedTask,
    loadingGrades,
    errorMessage,
    loadingSections,
    sectionsErrorMessage,
    loadingTasks,
    tasksErrorMessage,
    taskCount,
    generatedTask,
    taskErrorMessage,
    submitErrorMessage,
    submitResult,
    checkResult,
    resultByTaskId,
    lockedTaskIds,
    lastResultTaskId,
    selectedAnswers,
    activeTaskId,
    isSubmitting,
    hasResult,
    reset,
  }
})

export type { Section }

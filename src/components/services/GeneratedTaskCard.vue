<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { GeneratedTaskResponse } from '../../services/tasks'
import { renderRichText } from '../../utils/mathRenderer'

const props = defineProps<{
  generatedTask: GeneratedTaskResponse
  selectedAnswers: Record<string, string>
  freeAnswer: string
  lockedTaskIds: Record<string, boolean>
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'selectAnswer', taskId: string, optionKey: string): void
  (e: 'updateFreeAnswer', taskId: string, value: string): void
}>()

const freeAnswerRefs = ref(new Map<string, HTMLTextAreaElement>())
const freeAnswerViewByTask = ref<Record<string, 'editor' | 'preview'>>({})

marked.setOptions({ breaks: true })

const handleSelectAnswer = (taskId: string | undefined, optionKey: string): void => {
  if (!taskId) {
    return
  }
  emit('selectAnswer', taskId, optionKey)
}

const handleFreeAnswer = (taskId: string | undefined, value: string): void => {
  if (!taskId) {
    return
  }
  emit('updateFreeAnswer', taskId, value)
}

const setFreeAnswerRef = (taskId: string | undefined, element: HTMLTextAreaElement | null): void => {
  if (!taskId) {
    return
  }
  if (element) {
    freeAnswerRefs.value.set(taskId, element)
  } else {
    freeAnswerRefs.value.delete(taskId)
  }
}

const autoGrow = (element: HTMLTextAreaElement | null): void => {
  if (!element) {
    return
  }
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

const refreshFreeAnswerHeights = (): void => {
  void nextTick(() => {
    freeAnswerRefs.value.forEach((element) => {
      autoGrow(element)
    })
  })
}

const handleFreeAnswerInput = (taskId: string | undefined, event: Event): void => {
  const target = event.target as HTMLTextAreaElement | null
  autoGrow(target)
  handleFreeAnswer(taskId, target?.value ?? '')
}

const resolveFreeAnswerView = (taskId: string | undefined): 'editor' | 'preview' => {
  if (!taskId) {
    return 'editor'
  }
  return freeAnswerViewByTask.value[taskId] ?? 'editor'
}

const setFreeAnswerView = (taskId: string | undefined, view: 'editor' | 'preview'): void => {
  if (!taskId) {
    return
  }
  freeAnswerViewByTask.value = { ...freeAnswerViewByTask.value, [taskId]: view }
  if (view === 'editor') {
    refreshFreeAnswerHeights()
  }
}

const resolveTaskImages = (task: Record<string, unknown> | null): string[] => {
  if (!task) {
    return []
  }
  const taskImages = task.taskImages
  if (Array.isArray(taskImages)) {
    return taskImages.filter((image): image is string => typeof image === 'string' && image.length > 0)
  }
  return []
}

const taskHasOptions = (task: Record<string, unknown> | null | undefined): boolean => {
  const options = task?.options as Record<string, string> | null | undefined
  return Boolean(options && Object.keys(options).length > 0)
}

const previewHtml = computed(() => {
  const raw = props.freeAnswer || ''
  const html = marked.parse(raw) as string
  return DOMPurify.sanitize(html)
})

watch(
  () => props.freeAnswer,
  () => {
    refreshFreeAnswerHeights()
  },
)

watch(
  () => props.generatedTask?.tasks?.map((task) => task.id).join('|') ?? '',
  () => {
    freeAnswerViewByTask.value = {}
    refreshFreeAnswerHeights()
  },
)

onMounted(() => {
  refreshFreeAnswerHeights()
})
</script>

<template>
  <div class="services-task-result">
    <div class="services-task-meta">
      <p v-if="props.generatedTask.section?.sectionName" class="services-card__label">
        Раздел: {{ props.generatedTask.section.sectionName }}
      </p>
      <p v-if="props.generatedTask.taskSection?.taskName" class="services-card__label">
        Задача: {{ props.generatedTask.taskSection.taskName }}
      </p>
    </div>

    <div v-if="props.generatedTask.tasks?.length" class="services-task-list">
      <article v-for="task in props.generatedTask.tasks" :key="task.id" class="services-task">
        <img
          v-for="(imageSrc, index) in resolveTaskImages(task)"
          :key="`${task.id || 'task'}-image-${index}`"
          class="services-task__image"
          :src="imageSrc"
          alt=""
        />
        <p class="services-task__text" v-html="task.task ? renderRichText(task.task) : ''"></p>
        <div v-if="taskHasOptions(task)" class="services-task__options">
          <label
            v-for="(optionValue, optionKey) in task.options"
            :key="optionKey"
            class="services-task__option"
            :class="{ 'is-selected': task.id && props.selectedAnswers[task.id] === optionKey }"
          >
            <input
              type="radio"
              :name="`task-${task.id}`"
              :value="optionKey"
              :checked="props.selectedAnswers[task.id || ''] === optionKey"
              :disabled="(task.id && props.lockedTaskIds[task.id]) || props.isSubmitting"
              @change="handleSelectAnswer(task.id, optionKey)"
            />
            <span>
              <span>{{ optionKey }}:</span>
              <span v-html="renderRichText(optionValue)"></span>
            </span>
          </label>
        </div>
        <div v-else class="services-task__free-answer">
          <label class="services-task__free-answer-label" :for="`task-${task.id}-free-answer`">
            Въведи отговор
          </label>
          <div class="services-task__free-answer-tabs" role="tablist" aria-label="Преглед на отговора">
            <button
              type="button"
              class="services-task__free-answer-tab"
              :class="{ 'is-active': resolveFreeAnswerView(task.id) === 'editor' }"
              role="tab"
              :aria-selected="resolveFreeAnswerView(task.id) === 'editor'"
              @click="setFreeAnswerView(task.id, 'editor')"
            >
              Редактор
            </button>
            <button
              type="button"
              class="services-task__free-answer-tab"
              :class="{ 'is-active': resolveFreeAnswerView(task.id) === 'preview' }"
              role="tab"
              :aria-selected="resolveFreeAnswerView(task.id) === 'preview'"
              @click="setFreeAnswerView(task.id, 'preview')"
            >
              Преглед
            </button>
          </div>
          <textarea
            v-if="resolveFreeAnswerView(task.id) === 'editor'"
            :id="`task-${task.id}-free-answer`"
            class="services-task__free-answer-input"
            :value="props.freeAnswer"
            placeholder="Напиши решението си тук..."
            :disabled="(task.id && props.lockedTaskIds[task.id]) || props.isSubmitting"
            :ref="(el) => setFreeAnswerRef(task.id, el as HTMLTextAreaElement | null)"
            @input="handleFreeAnswerInput(task.id, $event)"
          ></textarea>
          <div
            v-else
            class="services-task__free-answer-preview"
            v-html="previewHtml"
          ></div>
          <p
            v-if="resolveFreeAnswerView(task.id) === 'editor'"
            class="services-task__free-answer-helper"
          >
            Можеш да пишеш на няколко реда. Използвай подробно обяснение.
          </p>
        </div>
        <p v-if="task.hint" class="services-task__hint">
          <span class="services-task__hint-label">Указание:</span>
          <span v-html="renderRichText(task.hint)"></span>
        </p>
      </article>
    </div>
  </div>
</template>

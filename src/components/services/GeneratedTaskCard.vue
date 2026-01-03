<script setup lang="ts">
import type { GeneratedTaskResponse } from '../../services/tasks'

const props = defineProps<{
  generatedTask: GeneratedTaskResponse
  selectedAnswers: Record<string, string>
  lockedTaskIds: Record<string, boolean>
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'selectAnswer', taskId: string, optionKey: string): void
}>()

const handleSelectAnswer = (taskId: string | undefined, optionKey: string): void => {
  if (!taskId) {
    return
  }
  emit('selectAnswer', taskId, optionKey)
}
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
        <p class="services-task__text">{{ task.task }}</p>
        <div class="services-task__options">
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
</template>

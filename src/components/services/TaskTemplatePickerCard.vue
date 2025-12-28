<script setup lang="ts">
import type { TaskDto } from '../../services/tasks'

const props = defineProps<{
  tasks: TaskDto[]
  selectedTaskId: string | null
  loading: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  (e: 'select', value: TaskDto): void
}>()

const handleSelect = (task: TaskDto): void => {
  emit('select', task)
}
</script>

<template>
  <div class="services-task-picker">
    <div class="services-task-picker__header">
      <span class="services-card__label">Избери задача</span>
      <span v-if="props.loading" class="services-card__status">Зареждане...</span>
    </div>
    <p v-if="props.errorMessage" class="services-card__error">{{ props.errorMessage }}</p>
    <div v-else class="services-task-picker__list">
      <button
        v-for="task in props.tasks"
        :key="task.id"
        type="button"
        class="services-task-picker__item"
        :class="{ 'is-selected': props.selectedTaskId === task.id }"
        @click="handleSelect(task)"
      >
        {{ task.taskName }}
      </button>
    </div>
  </div>
</template>

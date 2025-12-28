<script setup lang="ts">
import type { GradeDto } from '../../services/tasks'

const props = defineProps<{
  grades: GradeDto[]
  selectedGradeKey: string | null
  loading: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  (e: 'select', value: GradeDto): void
}>()

const handleSelect = (grade: GradeDto): void => {
  emit('select', grade)
}
</script>

<template>
  <div class="services-card">
    <div class="services-card__header">
      <h2 class="services-card__title">Избери клас</h2>
      <span v-if="props.loading" class="services-card__status">Зареждане...</span>
    </div>
    <p v-if="props.errorMessage" class="services-card__error">{{ props.errorMessage }}</p>
    <div v-else class="services-grade-list">
      <button
        v-for="grade in props.grades"
        :key="grade.key"
        type="button"
        class="services-grade"
        :class="{ 'is-selected': props.selectedGradeKey === grade.key }"
        @click="handleSelect(grade)"
      >
        {{ grade.level ?? grade.label }}
      </button>
    </div>
  </div>
</template>

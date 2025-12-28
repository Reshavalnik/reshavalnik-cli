<script setup lang="ts">
import type { SectionDto } from '../../services/tasks'

const props = defineProps<{
  sections: SectionDto[]
  selectedSectionId: string | null
  loading: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  (e: 'select', value: SectionDto): void
}>()

const handleSelect = (section: SectionDto): void => {
  emit('select', section)
}
</script>

<template>
  <div class="services-card">
    <div class="services-card__header">
      <h2 class="services-card__title">Избери урок</h2>
      <span v-if="props.loading" class="services-card__status">Зареждане...</span>
    </div>
    <p v-if="props.errorMessage" class="services-card__error">{{ props.errorMessage }}</p>
    <div v-else class="services-section-list">
      <button
        v-for="section in props.sections"
        :key="section.id"
        type="button"
        class="services-section"
        :class="{ 'is-selected': props.selectedSectionId === section.id }"
        @click="handleSelect(section)"
      >
        {{ section.sectionName }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type Section = 'class' | 'lesson' | 'task'

const props = defineProps<{
  activeSection: Section
  lessonEnabled: boolean
  taskEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'select', value: Section): void
}>()

const handleSelect = (section: Section): void => {
  emit('select', section)
}
</script>

<template>
  <aside class="services-sidebar">
    <h2 class="services-sidebar__title">Навигация</h2>
    <button
      type="button"
      class="services-sidebar__item"
      :class="{ 'is-active': props.activeSection === 'class' }"
      @click="handleSelect('class')"
    >
      Клас
    </button>
    <button
      type="button"
      class="services-sidebar__item"
      :class="{ 'is-active': props.activeSection === 'lesson' }"
      :disabled="!props.lessonEnabled"
      @click="handleSelect('lesson')"
    >
      Урок
    </button>
    <button
      type="button"
      class="services-sidebar__item"
      :class="{ 'is-active': props.activeSection === 'task' }"
      :disabled="!props.taskEnabled"
      @click="handleSelect('task')"
    >
      Задача
    </button>
  </aside>
</template>

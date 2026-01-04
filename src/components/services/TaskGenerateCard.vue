<script setup lang="ts">
const props = defineProps<{
  count: number
  canGenerate: boolean
  errorMessage: string | null
  showCount?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'generate'): void
}>()

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:count', Number(target.value))
}

const handleGenerate = (): void => {
  emit('generate')
}
</script>

<template>
  <div>
    <div class="services-task-controls">
      <label v-if="props.showCount !== false" class="services-task-controls__field">
        <span>Брой</span>
        <input :value="props.count" type="number" min="1" @input="handleInput" />
      </label>
      <button
        type="button"
        class="services-task-controls__button"
        :disabled="!props.canGenerate"
        @click="handleGenerate"
      >
        Генерирай
      </button>
    </div>
    <p v-if="props.errorMessage" class="services-card__error">{{ props.errorMessage }}</p>
  </div>
</template>

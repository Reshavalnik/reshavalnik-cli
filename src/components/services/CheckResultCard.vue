<script setup lang="ts">
import { computed } from 'vue'
import { renderMathText } from '../../utils/mathRenderer'

const props = defineProps<{
  result: {
    task?: string
    options?: Record<string, string>
    answer?: string
    hint?: string
    solution?: string
    result?: boolean
    mathDialect?: 'legacy' | 'wizu5'
  }
  correctAnswer: string
  showRetry: boolean
  solutionImages?: string[] | null
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const handleRetry = (): void => {
  emit('retry')
}

const useWizu5 = computed(() => props.result.mathDialect === 'wizu5')
</script>

<template>
  <div class="services-card services-card--result">
    <div class="services-result__status" :class="{ 'is-correct': props.result.result }">
      {{ props.result.result ? 'ВЯРНО' : 'ГРЕШНО' }}
    </div>
    <div class="services-result__details">
      <p><strong>Задача:</strong> <span v-html="renderMathText(props.result.task || '', { wizu5: useWizu5 })"></span></p>
      <p><strong>Избран отговор:</strong> {{ props.result.answer }}</p>
      <p><strong>Верен отговор:</strong> {{ props.correctAnswer }}</p>
      <div v-if="props.result.options" class="services-result__options">
        <strong>Възможни отговори:</strong>
        <ul>
          <li v-for="(value, key) in props.result.options" :key="key">
            <span>{{ key }}:</span>
            <span v-html="renderMathText(value, { wizu5: useWizu5 })"></span>
          </li>
        </ul>
      </div>
      <p v-if="props.result.hint"><strong>Помощ:</strong> <span v-html="renderMathText(props.result.hint, { wizu5: useWizu5 })"></span></p>
      <p v-if="props.result.solution"><strong>Решение:</strong> <span v-html="renderMathText(props.result.solution, { wizu5: useWizu5 })"></span></p>
      <img
        v-for="(imageSrc, index) in props.solutionImages || []"
        :key="`solution-image-${index}`"
        class="services-task__image"
        :src="imageSrc"
        alt=""
      />
    </div>
    <button v-if="props.showRetry" type="button" class="services-result__retry" @click="handleRetry">
      Опитай пак
    </button>
  </div>
</template>

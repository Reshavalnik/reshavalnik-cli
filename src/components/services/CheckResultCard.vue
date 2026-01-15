<script setup lang="ts">
import { renderMath } from '../../utils/mathRenderer'

const props = defineProps<{
  result: {
    task?: string
    options?: Record<string, string>
    answer?: string
    hint?: string
    solution?: string
    result?: boolean
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
</script>

<template>
  <div class="services-card services-card--result">
    <div class="services-result__status" :class="{ 'is-correct': props.result.result }">
      {{ props.result.result ? 'ВЯРНО' : 'ГРЕШНО' }}
    </div>
    <div class="services-result__details">
      <p><strong>Задача:</strong> <span v-html="renderMath(props.result.task || '')"></span></p>
      <p><strong>Избран отговор:</strong> {{ props.result.answer }}</p>
      <p><strong>Верен отговор:</strong> {{ props.correctAnswer }}</p>
      <div v-if="props.result.options" class="services-result__options">
        <strong>Възможни отговори:</strong>
        <ul>
          <li v-for="(value, key) in props.result.options" :key="key">
            <span>{{ key }}:</span>
            <span v-html="renderMath(value)"></span>
          </li>
        </ul>
      </div>
      <p v-if="props.result.hint"><strong>Помощ:</strong> <span v-html="renderMath(props.result.hint)"></span></p>
      <p v-if="props.result.solution"><strong>Решение:</strong> <span v-html="renderMath(props.result.solution)"></span></p>
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

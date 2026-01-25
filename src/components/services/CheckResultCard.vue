<script setup lang="ts">
import MathJaxText from '../MathJaxText.vue'
import { normalizeLatexText, normalizeOptionValue } from '../../utils/latexNormalize'

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

</script>

<template>
  <div class="services-card services-card--result">
    <div class="services-result__status" :class="{ 'is-correct': props.result.result }">
      {{ props.result.result ? 'ВЯРНО' : 'ГРЕШНО' }}
    </div>
    <div class="services-result__details">
      <div class="services-result__row">
        <strong class="services-result__label">Задача:</strong>
        <span class="services-result__value">
          <MathJaxText
            :content="normalizeLatexText(props.result.task || '')"
            :block="true"
          />
        </span>
      </div>
      <div class="services-result__row">
        <strong class="services-result__label">Избран отговор:</strong>
        <span class="services-result__value">{{ props.result.answer }}</span>
      </div>
      <div class="services-result__row">
        <strong class="services-result__label">Верен отговор:</strong>
        <span class="services-result__value">{{ props.correctAnswer }}</span>
      </div>
      <div v-if="props.result.options" class="services-result__options">
        <strong>Възможни отговори:</strong>
        <ul>
          <li v-for="(value, key) in props.result.options" :key="key">
            <span>{{ key }}:</span>
            <MathJaxText :content="normalizeOptionValue(value)" />
          </li>
        </ul>
      </div>
      <div v-if="props.result.hint" class="services-result__row">
        <strong class="services-result__label">Помощ:</strong>
        <span class="services-result__value">
          <MathJaxText :content="normalizeLatexText(props.result.hint)" />
        </span>
      </div>
      <div v-if="props.result.solution" class="services-result__row">
        <strong class="services-result__label">Решение:</strong>
        <span class="services-result__value">
          <MathJaxText :content="normalizeLatexText(props.result.solution)" :block="true" />
        </span>
      </div>
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

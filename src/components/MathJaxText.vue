<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  content?: string | null
  block?: boolean
}>(), {
  block: false,
  content: '',
})

const root = ref<HTMLElement | null>(null)
const htmlContent = computed(() => props.content ?? '')

let retryTimer: number | null = null
let retryCount = 0
const maxRetries = 10

const clearRetryTimer = (): void => {
  if (retryTimer !== null) {
    window.clearTimeout(retryTimer)
    retryTimer = null
  }
}

const typeset = async (): Promise<void> => {
  await nextTick()
  const mathjax = (window as typeof window & {
    MathJax?: {
      typesetPromise?: (nodes?: Element[]) => Promise<void>
      typesetClear?: (nodes?: Element[]) => void
    }
  }).MathJax
  if (!root.value || !mathjax?.typesetPromise) {
    if (retryCount < maxRetries) {
      retryCount += 1
      clearRetryTimer()
      retryTimer = window.setTimeout(() => {
        void typeset()
      }, 50)
    }
    return
  }
  retryCount = 0
  if (mathjax.typesetClear) {
    mathjax.typesetClear([root.value])
  }
  await mathjax.typesetPromise([root.value])
}

onMounted(() => {
  void typeset()
})

watch(
  () => [htmlContent.value, props.block],
  () => {
    void typeset()
  },
)

onBeforeUnmount(() => {
  clearRetryTimer()
})
</script>

<template>
  <span
    ref="root"
    class="mathjax-text"
    :class="{ 'mathjax-text--block': props.block }"
    v-html="htmlContent"
  ></span>
</template>

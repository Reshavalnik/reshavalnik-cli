<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  latex: string
  display?: boolean
}>(), {
  display: false,
})

const root = ref<HTMLElement | null>(null)
const containsLatex = (text: string): boolean => {
  return /\\\(|\\\)|\\\[|\\\]|\\frac|\\sqrt|\\text|[\^_]/.test(text)
}
const normalizeText = (value: string): string => {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}
const normalizeDelimiters = (value: string): string => {
  if (value.includes('\\(') || value.includes('\\)')) {
    return value
  }
  if (value.includes('/(') && value.includes('/)')) {
    return value.replace(/\/\(/g, '\\(').replace(/\/\)/g, '\\)')
  }
  return value
}
const normalizedLatex = computed(() => normalizeDelimiters(normalizeText(props.latex ?? '')))
const isLatex = computed(() => containsLatex(normalizedLatex.value))
const wrappedLatex = computed(() => {
  const value = normalizedLatex.value
  return props.display ? `\\[${value}\\]` : `\\(${value}\\)`
})

let pendingFrame: number | null = null

const scheduleTypeset = (retry = true): void => {
  if (!isLatex.value) {
    return
  }
  if (pendingFrame !== null) {
    return
  }
  pendingFrame = window.requestAnimationFrame(async () => {
    pendingFrame = null
    await nextTick()
    const mathjax = (window as typeof window & { MathJax?: { typesetPromise?: (nodes?: Element[]) => Promise<void> } }).MathJax
    if (root.value && mathjax?.typesetPromise) {
      await mathjax.typesetPromise([root.value])
      return
    }
    if (retry) {
      await nextTick()
      if (root.value && mathjax?.typesetPromise) {
        await mathjax.typesetPromise([root.value])
      }
    }
  })
}

onMounted(() => {
  scheduleTypeset(true)
})

watch(
  () => [normalizedLatex.value, props.display, isLatex.value],
  () => {
    scheduleTypeset(true)
  },
)

onBeforeUnmount(() => {
  if (pendingFrame !== null) {
    window.cancelAnimationFrame(pendingFrame)
    pendingFrame = null
  }
})
</script>

<template>
  <span ref="root">
    <template v-if="isLatex">{{ wrappedLatex }}</template>
    <template v-else>{{ normalizedLatex }}</template>
  </span>
</template>

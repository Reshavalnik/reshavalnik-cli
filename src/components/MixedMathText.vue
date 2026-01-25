<script setup lang="ts">
import { computed } from 'vue'
import MathText from './MathText.vue'
import { splitIntoTextAndMathSegments, type MixedSegment } from '../utils/math/mixedText'

const props = defineProps<{
  value: string
}>()

const segments = computed<MixedSegment[]>(() => splitIntoTextAndMathSegments(props.value ?? ''))
</script>

<template>
  <span>
    <template v-for="(segment, index) in segments" :key="`${segment.type}-${index}`">
      <span v-if="segment.type === 'text'" v-text="segment.value"></span>
      <MathText v-else :latex="segment.value" :display="segment.display" />
    </template>
  </span>
</template>

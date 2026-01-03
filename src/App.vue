<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './components/TopNav.vue'
import DevStatusOverlay from './components/DevStatusOverlay.vue'

const isDev = import.meta.env.DEV
const route = useRoute()
const isAuthRoute = computed(() => route.path.startsWith('/auth') || route.path.startsWith('/login'))
const isStudentMathematicRoute = computed(() => route.path.startsWith('/student-mathematic'))
const showTopNav = computed(() => !isAuthRoute.value)
const showDevOverlay = computed(() => route.path.startsWith('/panel') && !isStudentMathematicRoute.value)
</script>

<template>
  <TopNav v-if="showTopNav" />
  <router-view />
  <DevStatusOverlay v-if="isDev && showDevOverlay" />
</template>

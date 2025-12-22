<script setup lang="ts">
import TopNav from './components/TopNav.vue'
import DevStatusOverlay from './components/DevStatusOverlay.vue'

const isDev = import.meta.env.DEV
</script>

<template>
  <TopNav />
  <router-view />
  <DevStatusOverlay v-if="isDev" />
</template>

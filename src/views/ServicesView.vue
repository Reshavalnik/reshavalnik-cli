<script setup lang="ts">
import { ref } from 'vue'

type Section = 'Клас' | 'Урок' | 'Задача'

const selectedSection = ref<Section>('Задача')

const setSection = (next: Section): void => {
  selectedSection.value = next
}
</script>

<template>
  <div class="services-page">
    <aside class="services-sidebar">
      <h2 class="services-sidebar__title">Навигация</h2>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': selectedSection === 'Клас' }"
        @click="setSection('Клас')"
      >
        Клас
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': selectedSection === 'Урок' }"
        @click="setSection('Урок')"
      >
        Урок
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': selectedSection === 'Задача' }"
        @click="setSection('Задача')"
      >
        Задача
      </button>
    </aside>

    <section class="services-content">
      <h1 class="services-title">{{ selectedSection }}</h1>
      <p class="services-subtitle">Available offerings will appear here.</p>
    </section>
  </div>
</template>

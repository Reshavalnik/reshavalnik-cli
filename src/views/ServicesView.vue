<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAllGrades, getAllSections, type GradeDto, type SectionDto } from '../services/tasks'

type Section = 'class' | 'lesson' | 'task'

const activeSection = ref<Section>('class')
const grades = ref<GradeDto[]>([])
const selectedGrade = ref<GradeDto | null>(null)
const sectionsByGrade = ref<Record<string, SectionDto[]>>({})
const selectedSection = ref<SectionDto | null>(null)
const loadingGrades = ref(false)
const errorMessage = ref<string | null>(null)
const loadingSections = ref(false)
const sectionsErrorMessage = ref<string | null>(null)

const lessonEnabled = computed(() => selectedGrade.value !== null)
const taskEnabled = computed(() => selectedSection.value !== null)
const gradeName = computed(() => selectedGrade.value?.key ?? '')

const loadGrades = async (): Promise<void> => {
  loadingGrades.value = true
  errorMessage.value = null
  try {
    grades.value = await getAllGrades()
  } catch {
    grades.value = []
    errorMessage.value = 'Неуспешно зареждане на класовете.'
  } finally {
    loadingGrades.value = false
  }
}

const setActiveSection = (next: Section): void => {
  if (next === 'lesson' && !lessonEnabled.value) {
    return
  }
  if (next === 'task' && !taskEnabled.value) {
    return
  }
  activeSection.value = next
  if (next === 'lesson') {
    void loadSections()
  }
}

const selectGrade = (grade: GradeDto): void => {
  selectedGrade.value = grade
  selectedSection.value = null
  activeSection.value = 'class'
}

const loadSections = async (): Promise<void> => {
  const currentGrade = gradeName.value
  if (!currentGrade) {
    return
  }
  if (sectionsByGrade.value[currentGrade]) {
    return
  }
  loadingSections.value = true
  sectionsErrorMessage.value = null
  try {
    const sections = await getAllSections(currentGrade)
    sectionsByGrade.value = { ...sectionsByGrade.value, [currentGrade]: sections }
  } catch {
    sectionsErrorMessage.value = 'Неуспешно зареждане на уроците.'
  } finally {
    loadingSections.value = false
  }
}

const selectSection = (section: SectionDto): void => {
  selectedSection.value = section
}

onMounted(async () => {
  await loadGrades()
})
</script>

<template>
  <div class="services-page">
    <aside class="services-sidebar">
      <h2 class="services-sidebar__title">Навигация</h2>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'class' }"
        @click="setActiveSection('class')"
      >
        Клас
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'lesson' }"
        :disabled="!lessonEnabled"
        @click="setActiveSection('lesson')"
      >
        Урок
      </button>
      <button
        type="button"
        class="services-sidebar__item"
        :class="{ 'is-active': activeSection === 'task' }"
        :disabled="!taskEnabled"
        @click="setActiveSection('task')"
      >
        Задача
      </button>
    </aside>

    <section class="services-content">
      <div class="services-content__header">
        <button type="button" class="services-nav__button">Математика</button>
      </div>
      <h1 class="services-title">
        {{ activeSection === 'class' ? 'Клас' : activeSection === 'lesson' ? 'Урок' : 'Задача' }}
      </h1>
      <p class="services-subtitle">Available offerings will appear here.</p>

      <div v-if="activeSection === 'class'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Избери клас</h2>
          <span v-if="loadingGrades" class="services-card__status">Зареждане...</span>
        </div>
        <p v-if="errorMessage" class="services-card__error">{{ errorMessage }}</p>
        <div v-else class="services-grade-list">
          <button
            v-for="grade in grades"
            :key="grade.key"
            type="button"
            class="services-grade"
            :class="{ 'is-selected': selectedGrade?.key === grade.key }"
            @click="selectGrade(grade)"
          >
            {{ grade.level ?? grade.label }}
          </button>
        </div>
      </div>

      <div v-if="selectedGrade" class="services-card services-card--compact">
        <p class="services-card__label">Избран клас: {{ selectedGrade.desc || selectedGrade.label }}</p>
      </div>

      <div v-if="activeSection === 'lesson'" class="services-card">
        <div class="services-card__header">
          <h2 class="services-card__title">Избери урок</h2>
          <span v-if="loadingSections" class="services-card__status">Зареждане...</span>
        </div>
        <p v-if="sectionsErrorMessage" class="services-card__error">{{ sectionsErrorMessage }}</p>
        <div v-else class="services-section-list">
          <button
            v-for="section in sectionsByGrade[gradeName] || []"
            :key="section.id"
            type="button"
            class="services-section"
            :class="{ 'is-selected': selectedSection?.id === section.id }"
            @click="selectSection(section)"
          >
            {{ section.sectionName }}
          </button>
        </div>
      </div>

      <div v-if="selectedSection" class="services-card services-card--compact">
        <p class="services-card__label">Избран урок: {{ selectedSection.sectionName }}</p>
      </div>
    </section>
  </div>
</template>

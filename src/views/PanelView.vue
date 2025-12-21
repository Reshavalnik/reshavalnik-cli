<template>
  <div class="panel">
    <header class="panel__header">
      <div>
        <h1 class="panel__title">Task Panel</h1>
        <p class="panel__subtitle">
          Internal tools for managing tasks, sections & exams
        </p>
      </div>

      <nav class="tabs" aria-label="Panel sections">
        <button
          type="button"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': tab === 'tasks' }"
          @click="tab = 'tasks'"
        >
          Tasks
        </button>
        <button
          type="button"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': tab === 'generate' }"
          @click="tab = 'generate'"
        >
          Generate
        </button>
        <button
          type="button"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': tab === 'sections' }"
          @click="tab = 'sections'"
        >
          Sections
        </button>
        <button
          type="button"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': tab === 'exams' }"
          @click="tab = 'exams'"
        >
          Exams
        </button>
      </nav>
    </header>

    <!-- TASKS TAB -->
    <section v-if="tab === 'tasks'" class="tab">
      <div class="tab__header">
        <div>
          <h2 class="tab__title">Tasks</h2>
          <p class="tab__description">Create, update, search & delete tasks</p>
        </div>
        <div class="tab__actions">
          <button type="button" class="btn btn--ghost" @click="loadMyTasks">
            Load My Tasks
          </button>
          <button type="button" class="btn btn--ghost" @click="loadAllTasks">
            Load All
          </button>
        </div>
      </div>

      <div class="grid grid--3">
        <!-- Create Task -->
        <article class="card">
          <h3 class="card__title">Create Task</h3>
          <p class="card__subtitle">Upload a file with a JSON model</p>

          <form class="form" @submit.prevent="onCreate">
            <label class="form__field">
              <span class="form__label">Model JSON</span>
              <textarea
                v-model="createForm.model"
                rows="5"
                class="form__control form__textarea"
                placeholder='{"title":"Sample"}'
              ></textarea>
            </label>

            <label class="form__field">
              <span class="form__label">File</span>
              <input
                type="file"
                class="form__control form__file"
                @change="onFileSelect($event, 'create')"
              />
            </label>

            <button
              type="submit"
              class="btn btn--primary btn--block"
              :disabled="createDisabled"
            >
              Create
            </button>
          </form>
        </article>

        <!-- Update Task -->
        <article class="card">
          <h3 class="card__title">Update Task</h3>
          <p class="card__subtitle">Model JSON must contain an <code>id</code></p>

          <form class="form" @submit.prevent="onUpdate">
            <label class="form__field">
              <span class="form__label">Model JSON</span>
              <textarea
                v-model="updateForm.model"
                rows="5"
                class="form__control form__textarea"
                placeholder='{"id":"..."}'
              ></textarea>
            </label>

            <label class="form__field">
              <span class="form__label">File</span>
              <input
                type="file"
                class="form__control form__file"
                @change="onFileSelect($event, 'update')"
              />
            </label>

            <button
              type="submit"
              class="btn btn--primary btn--block"
              :disabled="updateDisabled"
            >
              Update
            </button>
          </form>
        </article>

        <!-- Find / Delete -->
        <article class="card">
          <h3 class="card__title">Find & Delete</h3>
          <p class="card__subtitle">Lookup tasks by ID or grade</p>

          <form class="form" @submit.prevent="onFindById">
            <label class="form__field">
              <span class="form__label">Task ID</span>
              <input
                v-model="findForm.id"
                class="form__control"
                placeholder="Task ID"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Get by ID
            </button>
          </form>

          <form class="form" @submit.prevent="onFindByGrade">
            <label class="form__field">
              <span class="form__label">Grade</span>
              <input
                v-model="gradeForm.grade"
                class="form__control"
                placeholder="Grade"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Get by Grade
            </button>
          </form>

          <form class="form" @submit.prevent="onDelete">
            <label class="form__field">
              <span class="form__label">Delete Task ID</span>
              <input
                v-model="deleteForm.id"
                class="form__control"
                placeholder="Task ID"
              />
            </label>
            <button type="submit" class="btn btn--danger btn--block">
              Delete
            </button>
          </form>
        </article>
      </div>

      <section class="result">
        <h3 class="result__title">Last response</h3>
        <pre class="result__pre">{{ formatJson(lastResult) }}</pre>
      </section>
    </section>

    <!-- GENERATE TAB -->
    <section v-if="tab === 'generate'" class="tab">
      <div class="tab__header">
        <div>
          <h2 class="tab__title">Generate Exam From Task</h2>
          <p class="tab__description">
            Provide a Task ID and count. Optionally list students (comma-separated).
          </p>
        </div>
      </div>

      <article class="card card--narrow">
        <form class="form" @submit.prevent="onGenerate">
          <div class="form__row form__row--3">
            <label class="form__field">
              <span class="form__label">Task ID</span>
              <input
                v-model="generateForm.taskId"
                class="form__control"
                placeholder="Task ID"
              />
            </label>

            <label class="form__field">
              <span class="form__label">Count</span>
              <input
                v-model.number="generateForm.count"
                type="number"
                min="1"
                class="form__control"
                placeholder="Count"
              />
            </label>

            <label class="form__field">
              <span class="form__label">Students (comma-separated)</span>
              <input
                v-model="generateForm.students"
                class="form__control"
                placeholder="e.g. alice,bob,charlie"
              />
            </label>
          </div>

          <div class="form__actions" style="display:flex;gap:.5rem;flex-wrap:wrap;">
            <button type="submit" class="btn btn--primary">
              Generate
            </button>
            <button type="button" class="btn btn--secondary" @click="onGenerateAndStart">
              Generate & Start
            </button>
            <button type="button" class="btn btn--ghost" @click="startSolving">
              Start Solving (fetch pending)
            </button>
          </div>

          <div v-if="currentExamId" class="solver">
            <div class="solver__row">
              <strong>Exam ID:</strong> {{ currentExamId }}
            </div>
            <div class="solver__row">
              <strong>Task Exam ID:</strong> {{ currentTaskExamId || 'N/A' }}
            </div>
            <div class="solver__row">
              <strong>Pending:</strong>
              <pre class="result__pre">{{ formatJson(pendingExam) }}</pre>
            </div>
            <div class="form__row">
              <label class="form__field" style="flex:1">
                <span class="form__label">Your Answer</span>
                <input
                  v-model="currentAnswer"
                  class="form__control"
                />
              </label>
              <button type="button" class="btn btn--primary" @click="submitCurrentAnswer">
                Submit Answer
              </button>
              <button type="button" class="btn btn--secondary" @click="finishCurrentExam">
                Finish Exam
              </button>
            </div>
          </div>
        </form>
      </article>

      <section class="result">
        <h3 class="result__title">Last response</h3>
        <pre class="result__pre">{{ formatJson(lastResult) }}</pre>
      </section>
    </section>

    <!-- SECTIONS TAB -->
    <section v-if="tab === 'sections'" class="tab">
      <div class="tab__header">
        <div>
          <h2 class="tab__title">Sections</h2>
          <p class="tab__description">Create and manage sections</p>
        </div>
      </div>

      <div class="grid grid--2">
        <article class="card">
          <h3 class="card__title">Manage Sections</h3>

          <form class="form" @submit.prevent="onAddSection">
            <label class="form__field">
              <span class="form__label">Section name</span>
              <input
                v-model="sectionAddForm.section"
                class="form__control"
                placeholder="Section name"
              />
            </label>
            <button type="submit" class="btn btn--primary btn--block">
              Add Section
            </button>
          </form>

          <form class="form" @submit.prevent="onGetSection">
            <label class="form__field">
              <span class="form__label">Section ID</span>
              <input
                v-model="sectionGetForm.sectionId"
                class="form__control"
                placeholder="Section ID"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Get Section
            </button>
          </form>

          <form class="form" @submit.prevent="onDeleteSection">
            <label class="form__field">
              <span class="form__label">Section ID</span>
              <input
                v-model="sectionDeleteForm.sectionId"
                class="form__control"
                placeholder="Section ID"
              />
            </label>
            <button type="submit" class="btn btn--danger btn--block">
              Delete Section
            </button>
          </form>

          <button type="button" class="btn btn--ghost btn--block" @click="onGetAllSections">
            Get All Sections
          </button>
        </article>
      </div>

      <section class="result">
        <h3 class="result__title">Last response</h3>
        <pre class="result__pre">{{ formatJson(lastResult) }}</pre>
      </section>
    </section>

    <!-- EXAMS TAB -->
    <section v-if="tab === 'exams'" class="tab">
      <div class="tab__header">
        <div>
          <h2 class="tab__title">Exams</h2>
          <p class="tab__description">Work with existing and pending exams</p>
        </div>
      </div>

      <div class="grid grid--2">
        <article class="card">
          <h3 class="card__title">Existing Exams</h3>

          <form class="form" @submit.prevent="onGetByExamExistTaskId">
            <label class="form__field">
              <span class="form__label">Exist Task ID</span>
              <input
                v-model="existTaskForm.taskId"
                class="form__control"
                placeholder="Exist Task ID"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Get By Exam Exist TaskId
            </button>
          </form>

          <button type="button" class="btn btn--ghost btn--block" @click="onGetAllExamExist">
            Get All Exist Exams
          </button>
        </article>

        <article class="card">
          <h3 class="card__title">Check & Finish Exam</h3>

          <form class="form" @submit.prevent="onCheckExam">
            <label class="form__field">
              <span class="form__label">Exam ID</span>
              <input
                v-model="checkExamForm.examId"
                class="form__control"
                placeholder="Exam ID"
              />
            </label>

            <label class="form__field">
              <span class="form__label">Task Exam ID</span>
              <input
                v-model="checkExamForm.taskExamId"
                class="form__control"
                placeholder="Task Exam ID"
              />
            </label>

            <label class="form__field">
              <span class="form__label">Answer</span>
              <input
                v-model="checkExamForm.answer"
                class="form__control"
                placeholder="Answer"
              />
            </label>

            <button type="submit" class="btn btn--primary btn--block">
              Check Result
            </button>
          </form>

          <button type="button" class="btn btn--ghost btn--block" @click="onFetchPendingExam">
            Fetch Pending Exam
          </button>

          <form class="form" @submit.prevent="onFinishExam">
            <label class="form__field">
              <span class="form__label">Exam ID</span>
              <input
                v-model="finishExamForm.examId"
                class="form__control"
                placeholder="Exam ID"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Finish Exam
            </button>
          </form>

          <form class="form" @submit.prevent="onGetAllResultExamByUser">
            <label class="form__field">
              <span class="form__label">User ID</span>
              <input
                v-model="resultByUserForm.userId"
                class="form__control"
                placeholder="User ID"
              />
            </label>
            <button type="submit" class="btn btn--secondary btn--block">
              Get Results by User
            </button>
          </form>
        </article>
      </div>

      <section class="result">
        <h3 class="result__title">Last response</h3>
        <pre class="result__pre">{{ formatJson(lastResult) }}</pre>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  addSection,
  checkResultExam,
  createTask,
  deleteSection,
  deleteTask,
  fetchPendingExam,
  finishExam,
  generateTask,
  getAllExamExist,
  getAllResultExamByUser,
  getAllSections,
  getAllTasks,
  getAllTasksByGrade,
  getByExamExistTaskId,
  getMyTasks,
  getSection,
  getTaskById,
  updateTask,
} from '../services/tasks'

type TabKey = 'tasks' | 'generate' | 'sections' | 'exams'

type Nullable<T> = T | null

const tab = ref<TabKey>('tasks')
const lastResult = ref<unknown>(null)

const createForm = reactive({ model: '' })
const updateForm = reactive({ model: '' })
const findForm = reactive({ id: '' })
const deleteForm = reactive({ id: '' })
const gradeForm = reactive({ grade: '' })
const generateForm = reactive({ taskId: '', count: 1, students: '' })

const sectionAddForm = reactive({ section: '' })
const sectionGetForm = reactive({ sectionId: '' })
const sectionDeleteForm = reactive({ sectionId: '' })

const existTaskForm = reactive({ taskId: '' })
const checkExamForm = reactive({ examId: '', taskExamId: '', answer: '' })
const finishExamForm = reactive({ examId: '' })
const resultByUserForm = reactive({ userId: '' })

const createFile = ref<Nullable<File>>(null)
const updateFile = ref<Nullable<File>>(null)

const currentExamId = ref<Nullable<string>>(null)
const currentTaskExamId = ref<Nullable<string>>(null)
const pendingExam = ref<unknown>(null)
const currentAnswer = ref('')

const createDisabled = computed(() => !createForm.model || !createFile.value)
const updateDisabled = computed(() => !updateForm.model || !updateFile.value)

const formatJson = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const onFileSelect = (event: Event, type: 'create' | 'update') => {
  const input = event.target as HTMLInputElement
  const file = input.files && input.files[0] ? input.files[0] : null
  if (type === 'create') {
    createFile.value = file
  } else {
    updateFile.value = file
  }
}

const parseJson = (value: string): Record<string, unknown> => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const loadMyTasks = async () => {
  lastResult.value = await getMyTasks()
}

const loadAllTasks = async () => {
  lastResult.value = await getAllTasks()
}

const onCreate = async () => {
  if (!createFile.value) return
  const model = JSON.parse(createForm.model || '')
  lastResult.value = await createTask(model, createFile.value)
}

const onUpdate = async () => {
  if (!updateFile.value) return
  const model = parseJson(updateForm.model || '{}')
  lastResult.value = await updateTask(model as { id: string }, updateFile.value)
}

const onFindById = async () => {
  const id = findForm.id || ''
  if (!id) return
  lastResult.value = await getTaskById(id)
}

const onFindByGrade = async () => {
  const grade = gradeForm.grade || ''
  if (!grade) return
  lastResult.value = await getAllTasksByGrade(grade)
}

const onDelete = async () => {
  const id = deleteForm.id || ''
  if (!id) return
  await deleteTask(id)
  lastResult.value = { deleted: id }
}

const onGenerate = async () => {
  const studentsCsv = (generateForm.students || '').trim()
  const students = studentsCsv
    ? studentsCsv.split(',').map((entry) => entry.trim()).filter(Boolean)
    : undefined
  const payload: { taskId: string; count: number; students?: string[] } = {
    taskId: generateForm.taskId || '',
    count: Number(generateForm.count) || 1,
  }
  if (students && students.length) {
    payload.students = students
  }
  lastResult.value = await generateTask(payload)
}

const onGenerateAndStart = () => {
  void onGenerate()
  setTimeout(() => {
    void startSolving()
  }, 200)
}

const startSolving = async () => {
  const response = await fetchPendingExam()
  pendingExam.value = response
  lastResult.value = response
  currentExamId.value = (response as { examId?: string; id?: string })?.examId
    || (response as { examId?: string; id?: string })?.id
    || currentExamId.value
  currentTaskExamId.value = (response as { examTaskId?: string })?.examTaskId ?? null
}

const submitCurrentAnswer = async () => {
  if (!currentExamId.value || !currentTaskExamId.value) return
  const answer = currentAnswer.value || ''
  lastResult.value = await checkResultExam(currentExamId.value, currentTaskExamId.value, answer)
  currentAnswer.value = ''
  void startSolving()
}

const finishCurrentExam = async () => {
  if (!currentExamId.value) return
  lastResult.value = await finishExam(currentExamId.value)
}

const onAddSection = async () => {
  const section = sectionAddForm.section || ''
  if (!section) return
  lastResult.value = await addSection(section)
}

const onGetSection = async () => {
  const sectionId = sectionGetForm.sectionId || ''
  if (!sectionId) return
  lastResult.value = await getSection(sectionId)
}

const onGetAllSections = async () => {
  lastResult.value = await getAllSections()
}

const onDeleteSection = async () => {
  const sectionId = sectionDeleteForm.sectionId || ''
  if (!sectionId) return
  await deleteSection(sectionId)
  lastResult.value = { deletedSection: sectionId }
}

const onGetByExamExistTaskId = async () => {
  const taskId = existTaskForm.taskId || ''
  if (!taskId) return
  lastResult.value = await getByExamExistTaskId(taskId)
}

const onGetAllExamExist = async () => {
  lastResult.value = await getAllExamExist()
}

const onCheckExam = async () => {
  lastResult.value = await checkResultExam(
    checkExamForm.examId || '',
    checkExamForm.taskExamId || '',
    checkExamForm.answer || '',
  )
}

const onFetchPendingExam = async () => {
  lastResult.value = await fetchPendingExam()
}

const onFinishExam = async () => {
  const examId = finishExamForm.examId || ''
  if (!examId) return
  lastResult.value = await finishExam(examId)
}

const onGetAllResultExamByUser = async () => {
  const userId = resultByUserForm.userId || ''
  if (!userId) return
  lastResult.value = await getAllResultExamByUser(userId)
}
</script>

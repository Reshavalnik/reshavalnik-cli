import http from './http'

export interface TaskRequestModel {
  title?: string
  description?: string
  grade?: string
  [key: string]: unknown
}

export interface TaskUpdateRequestModel extends TaskRequestModel {
  id: string
}

export interface GeneratedTaskRequestModel {
  taskId: string
  count: number
  students?: string[]
  [key: string]: unknown
}

const taskBase = '/api/task'

const toFormData = (model: TaskRequestModel, file?: File): FormData => {
  const formData = new FormData()
  formData.append('model', JSON.stringify(model))
  if (file) {
    formData.append('file', file)
  }
  return formData
}

const createTask = async (model: TaskRequestModel, file?: File): Promise<unknown> => {
  const response = await http.post(`${taskBase}/create`, toFormData(model, file))
  return response.data
}

const updateTask = async (model: TaskUpdateRequestModel, file?: File): Promise<unknown> => {
  const response = await http.patch(`${taskBase}/update`, toFormData(model, file))
  return response.data
}

const deleteTask = async (taskId: string): Promise<void> => {
  await http.delete(`${taskBase}/delete`, { params: { 'task-id': taskId } })
}

const getTaskById = async (taskId: string): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-by-id`, { params: { 'task-id': taskId } })
  return response.data
}

const getTasksByUser = async (userId: string): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-by-user`, { params: { 'user-id': userId } })
  return response.data
}

const getMyTasks = async (): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-my-tasks`)
  return response.data
}

const getAllTasks = async (): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-all`)
  return response.data
}

const getAllTasksByGrade = async (grade: string): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-all-by-grade`, { params: { grade } })
  return response.data
}

const generateTask = async (payload: GeneratedTaskRequestModel): Promise<unknown> => {
  const response = await http.post(`${taskBase}/generate`, payload)
  return response.data
}

const getByExamExistTaskId = async (taskId: string): Promise<unknown> => {
  const response = await http.post(`${taskBase}/get-by-exist-exam-id`, null, { params: { taskId } })
  return response.data
}

const getAllExamExist = async (): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-all-exist-exam`)
  return response.data
}

const addSection = async (section: string): Promise<unknown> => {
  const response = await http.post(`${taskBase}/add-section`, null, { params: { section } })
  return response.data
}

const getSection = async (sectionId: string): Promise<unknown> => {
  const response = await http.post(`${taskBase}/get-section`, null, { params: { sectionId } })
  return response.data
}

const getAllSections = async (): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-all-sections`)
  return response.data
}

const deleteSection = async (sectionId: string): Promise<void> => {
  await http.delete(`${taskBase}/delete-section`, { params: { sectionId } })
}

const checkResultExam = async (examId: string, taskExamId: string, answer: string): Promise<unknown> => {
  const response = await http.get(`${taskBase}/check-result-exam`, {
    params: { examId, taskExamId, answer },
  })
  return response.data
}

const getAllResultExamByUser = async (userId: string): Promise<unknown> => {
  const response = await http.get(`${taskBase}/get-all-result-exam-by-user`, { params: { userId } })
  return response.data
}

const fetchPendingExam = async (): Promise<unknown> => {
  const response = await http.get(`${taskBase}/fetch-pending-exam`)
  return response.data
}

const finishExam = async (examId: string): Promise<unknown> => {
  const response = await http.post(`${taskBase}/finish-exam`, null, { params: { examId } })
  return response.data
}

export {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByUser,
  getMyTasks,
  getAllTasks,
  getAllTasksByGrade,
  generateTask,
  getByExamExistTaskId,
  getAllExamExist,
  addSection,
  getSection,
  getAllSections,
  deleteSection,
  checkResultExam,
  getAllResultExamByUser,
  fetchPendingExam,
  finishExam,
}

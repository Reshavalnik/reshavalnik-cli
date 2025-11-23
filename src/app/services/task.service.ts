import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

function getApiBaseUrl(): string {
  const w = window as any;
  const fromWindow = w?.env?.API_BASE_URL || w?.API_BASE_URL;
  if (fromWindow) return fromWindow as string;
  const fromMeta = (document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement)?.content;
  if (fromMeta) return fromMeta;
  return 'http://localhost:8080';
}

export interface TaskRequestModel {
  // Keep minimal and flexible; backend will parse JSON model string
  title?: string;
  description?: string;
  grade?: string;
  [k: string]: any;
}

export interface TaskUpdateRequestModel extends TaskRequestModel {
  id: string;
}

export interface GeneratedTaskRequestModel {
  subject?: string;
  count?: number;
  grade?: string;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = getApiBaseUrl() + '/api/task';

  // Helpers to build multipart form
  private toFormData(model: any, file?: File): FormData {
    const fd = new FormData();
    fd.append('model', JSON.stringify(model));
    if (file) fd.append('file', file);
    return fd;
  }

  createTask(model: TaskRequestModel, file: File): Observable<any> {
    const body = this.toFormData(model, file);
    return this.http.post(`${this.baseUrl}/create`, body);
  }

  updateTask(model: TaskUpdateRequestModel, file: File): Observable<any> {
    const body = this.toFormData(model, file);
    return this.http.patch(`${this.baseUrl}/update`, body);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete`, { params: { 'task-id': taskId } });
  }

  getTaskById(taskId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-by-id`, { params: { 'task-id': taskId } });
  }

  getTasksByUser(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-by-user`, { params: { 'user-id': userId } });
  }

  getMyTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-my-tasks`);
  }

  getAllTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all`);
  }

  getAllTasksByGrade(grade: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-by-grade`, { params: { grade } });
    }

  generateTask(payload: GeneratedTaskRequestModel): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate`, payload);
  }

  getByExamExistTaskId(taskId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-by-exist-exam-id`, null, { params: { taskId } });
  }

  getAllExamExist(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-exist-exam`);
  }

  addSection(section: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-section`, null, { params: { section } });
  }

  getSection(sectionId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-section`, null, { params: { sectionId } });
  }

  getAllSections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-sections`);
  }

  deleteSection(sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-section`, { params: { sectionId } });
  }

  checkResultExam(examId: string, taskExamId: string, answer: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-result-exam`, { params: { examId, taskExamId, answer } });
  }

  getAllResultExamByUser(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-result-exam-by-user`, { params: { userId } });
  }

  fetchPendingExam(): Observable<any> {
    return this.http.get(`${this.baseUrl}/fetch-pending-exam`);
  }

  finishExam(examId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/finish-exam`, null, { params: { examId } });
  }
}

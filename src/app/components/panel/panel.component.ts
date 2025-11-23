import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
            [class.tabs__btn--active]="tab === 'tasks'"
            (click)="tab='tasks'"
          >
            Tasks
          </button>
          <button
            type="button"
            class="tabs__btn"
            [class.tabs__btn--active]="tab === 'generate'"
            (click)="tab='generate'"
          >
            Generate
          </button>
          <button
            type="button"
            class="tabs__btn"
            [class.tabs__btn--active]="tab === 'sections'"
            (click)="tab='sections'"
          >
            Sections
          </button>
          <button
            type="button"
            class="tabs__btn"
            [class.tabs__btn--active]="tab === 'exams'"
            (click)="tab='exams'"
          >
            Exams
          </button>
        </nav>
      </header>

      <!-- TASKS TAB -->
      <section *ngIf="tab==='tasks'" class="tab">
        <div class="tab__header">
          <div>
            <h2 class="tab__title">Tasks</h2>
            <p class="tab__description">Create, update, search & delete tasks</p>
          </div>
          <div class="tab__actions">
            <button type="button" class="btn btn--ghost" (click)="loadMyTasks()">
              Load My Tasks
            </button>
            <button type="button" class="btn btn--ghost" (click)="loadAllTasks()">
              Load All
            </button>
          </div>
        </div>

        <div class="grid grid--3">
          <!-- Create Task -->
          <article class="card">
            <h3 class="card__title">Create Task</h3>
            <p class="card__subtitle">Upload a file with a JSON model</p>

            <form [formGroup]="createForm" (ngSubmit)="onCreate()" class="form">
              <label class="form__field">
                <span class="form__label">Model JSON</span>
                <textarea
                  formControlName="model"
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
                  (change)="onFileSelect($event, 'create')"
                />
              </label>

              <button
                type="submit"
                class="btn btn--primary btn--block"
                [disabled]="createForm.invalid || !createFile"
              >
                Create
              </button>
            </form>
          </article>

          <!-- Update Task -->
          <article class="card">
            <h3 class="card__title">Update Task</h3>
            <p class="card__subtitle">Model JSON must contain an <code>id</code></p>

            <form [formGroup]="updateForm" (ngSubmit)="onUpdate()" class="form">
              <label class="form__field">
                <span class="form__label">Model JSON</span>
                <textarea
                  formControlName="model"
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
                  (change)="onFileSelect($event, 'update')"
                />
              </label>

              <button
                type="submit"
                class="btn btn--primary btn--block"
                [disabled]="updateForm.invalid || !updateFile"
              >
                Update
              </button>
            </form>
          </article>

          <!-- Find / Delete -->
          <article class="card">
            <h3 class="card__title">Find & Delete</h3>
            <p class="card__subtitle">Lookup tasks by ID or grade</p>

            <form [formGroup]="findForm" (ngSubmit)="onFindById()" class="form">
              <label class="form__field">
                <span class="form__label">Task ID</span>
                <input
                  formControlName="id"
                  class="form__control"
                  placeholder="Task ID"
                />
              </label>
              <button type="submit" class="btn btn--secondary btn--block">
                Get by ID
              </button>
            </form>

            <form [formGroup]="gradeForm" (ngSubmit)="onFindByGrade()" class="form">
              <label class="form__field">
                <span class="form__label">Grade</span>
                <input
                  formControlName="grade"
                  class="form__control"
                  placeholder="Grade"
                />
              </label>
              <button type="submit" class="btn btn--secondary btn--block">
                Get by Grade
              </button>
            </form>

            <form [formGroup]="deleteForm" (ngSubmit)="onDelete()" class="form">
              <label class="form__field">
                <span class="form__label">Delete Task ID</span>
                <input
                  formControlName="id"
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
          <pre class="result__pre">{{ lastResult | json }}</pre>
        </section>
      </section>

      <!-- GENERATE TAB -->
      <section *ngIf="tab==='generate'" class="tab">
        <div class="tab__header">
          <div>
            <h2 class="tab__title">Generate Tasks</h2>
            <p class="tab__description">Quickly create tasks for a subject</p>
          </div>
        </div>

        <article class="card card--narrow">
          <form [formGroup]="generateForm" (ngSubmit)="onGenerate()" class="form">
            <div class="form__row form__row--3">
              <label class="form__field">
                <span class="form__label">Subject</span>
                <input
                  formControlName="subject"
                  class="form__control"
                  placeholder="Subject"
                />
              </label>

              <label class="form__field">
                <span class="form__label">Grade</span>
                <input
                  formControlName="grade"
                  class="form__control"
                  placeholder="Grade"
                />
              </label>

              <label class="form__field">
                <span class="form__label">Count</span>
                <input
                  formControlName="count"
                  type="number"
                  class="form__control"
                  placeholder="Count"
                />
              </label>
            </div>

            <div class="form__actions">
              <button type="submit" class="btn btn--primary">
                Generate
              </button>
            </div>
          </form>
        </article>

        <section class="result">
          <h3 class="result__title">Last response</h3>
          <pre class="result__pre">{{ lastResult | json }}</pre>
        </section>
      </section>

      <!-- SECTIONS TAB -->
      <section *ngIf="tab==='sections'" class="tab">
        <div class="tab__header">
          <div>
            <h2 class="tab__title">Sections</h2>
            <p class="tab__description">Create and manage sections</p>
          </div>
        </div>

        <div class="grid grid--2">
          <article class="card">
            <h3 class="card__title">Manage Sections</h3>

            <form [formGroup]="sectionAddForm" (ngSubmit)="onAddSection()" class="form">
              <label class="form__field">
                <span class="form__label">Section name</span>
                <input
                  formControlName="section"
                  class="form__control"
                  placeholder="Section name"
                />
              </label>
              <button type="submit" class="btn btn--primary btn--block">
                Add Section
              </button>
            </form>

            <form [formGroup]="sectionGetForm" (ngSubmit)="onGetSection()" class="form">
              <label class="form__field">
                <span class="form__label">Section ID</span>
                <input
                  formControlName="sectionId"
                  class="form__control"
                  placeholder="Section ID"
                />
              </label>
              <button type="submit" class="btn btn--secondary btn--block">
                Get Section
              </button>
            </form>

            <form
              [formGroup]="sectionDeleteForm"
              (ngSubmit)="onDeleteSection()"
              class="form"
            >
              <label class="form__field">
                <span class="form__label">Section ID</span>
                <input
                  formControlName="sectionId"
                  class="form__control"
                  placeholder="Section ID"
                />
              </label>
              <button type="submit" class="btn btn--danger btn--block">
                Delete Section
              </button>
            </form>

            <button type="button" class="btn btn--ghost btn--block" (click)="onGetAllSections()">
              Get All Sections
            </button>
          </article>
        </div>

        <section class="result">
          <h3 class="result__title">Last response</h3>
          <pre class="result__pre">{{ lastResult | json }}</pre>
        </section>
      </section>

      <!-- EXAMS TAB -->
      <section *ngIf="tab==='exams'" class="tab">
        <div class="tab__header">
          <div>
            <h2 class="tab__title">Exams</h2>
            <p class="tab__description">Work with existing and pending exams</p>
          </div>
        </div>

        <div class="grid grid--2">
          <article class="card">
            <h3 class="card__title">Existing Exams</h3>

            <form [formGroup]="existTaskForm" (ngSubmit)="onGetByExamExistTaskId()" class="form">
              <label class="form__field">
                <span class="form__label">Exist Task ID</span>
                <input
                  formControlName="taskId"
                  class="form__control"
                  placeholder="Exist Task ID"
                />
              </label>
              <button type="submit" class="btn btn--secondary btn--block">
                Get By Exam Exist TaskId
              </button>
            </form>

            <button type="button" class="btn btn--ghost btn--block" (click)="onGetAllExamExist()">
              Get All Exist Exams
            </button>
          </article>

          <article class="card">
            <h3 class="card__title">Check & Finish Exam</h3>

            <form [formGroup]="checkExamForm" (ngSubmit)="onCheckExam()" class="form">
              <label class="form__field">
                <span class="form__label">Exam ID</span>
                <input
                  formControlName="examId"
                  class="form__control"
                  placeholder="Exam ID"
                />
              </label>

              <label class="form__field">
                <span class="form__label">Task Exam ID</span>
                <input
                  formControlName="taskExamId"
                  class="form__control"
                  placeholder="Task Exam ID"
                />
              </label>

              <label class="form__field">
                <span class="form__label">Answer</span>
                <input
                  formControlName="answer"
                  class="form__control"
                  placeholder="Answer"
                />
              </label>

              <button type="submit" class="btn btn--primary btn--block">
                Check Result
              </button>
            </form>

            <button type="button" class="btn btn--ghost btn--block" (click)="onFetchPendingExam()">
              Fetch Pending Exam
            </button>

            <form [formGroup]="finishExamForm" (ngSubmit)="onFinishExam()" class="form">
              <label class="form__field">
                <span class="form__label">Exam ID</span>
                <input
                  formControlName="examId"
                  class="form__control"
                  placeholder="Exam ID"
                />
              </label>
              <button type="submit" class="btn btn--secondary btn--block">
                Finish Exam
              </button>
            </form>

            <form
              [formGroup]="resultByUserForm"
              (ngSubmit)="onGetAllResultExamByUser()"
              class="form"
            >
              <label class="form__field">
                <span class="form__label">User ID</span>
                <input
                  formControlName="userId"
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
          <pre class="result__pre">{{ lastResult | json }}</pre>
        </section>
      </section>
    </div>
  `,
  styles: [`
    .panel {
      max-width: 1200px;
      margin: 64px auto auto auto;
      padding: 1.5rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      sans-serif;
      color: #111827;
      background-color: #f9fafb;
    }

    .panel__header {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .panel__title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 600;
    }

    .panel__subtitle {
      margin: 0.15rem 0 0;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .tabs {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.25rem;
      border-radius: 999px;
      background: #e5e7eb;
    }

    .tabs__btn {
      border: none;
      background: transparent;
      border-radius: 999px;
      padding: 0.35rem 0.9rem;
      font-size: 0.9rem;
      cursor: pointer;
      color: #374151;
      transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;

      &--active {
        background: #2563eb;
        color: #ffffff;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06),
        0 4px 10px rgba(37, 99, 235, 0.35);
      }

      &:hover:not(&--active) {
        background: rgba(255, 255, 255, 0.8);
      }
    }

    .tab {
      background: #ffffff;
      border-radius: 0.75rem;
      padding: 1.25rem;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
    }

    .tab__header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .tab__title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .tab__description {
      margin: 0.15rem 0 0;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .tab__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Grid layout */

    .grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.25rem;

      &--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      &--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 960px) {
      .grid--3,
      .grid--2 {
        grid-template-columns: minmax(0, 1fr);
      }

      .tab {
        padding: 1rem;
      }
    }

    /* Cards */

    .card {
      background: #f9fafb;
      border-radius: 0.75rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;

      &--narrow {
        max-width: 700px;
      }
    }

    .card__title {
      margin: 0 0 0.25rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .card__subtitle {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      color: #6b7280;
    }

    /* Forms */

    .form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form__label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #4b5563;
    }

    .form__control {
      border-radius: 0.5rem;
      border: 1px solid #d1d5db;
      padding: 0.45rem 0.6rem;
      font-size: 0.9rem;
      background-color: #ffffff;
      transition: border-color 0.12s ease, box-shadow 0.12s ease;

      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.4);
      }
    }

    .form__textarea {
      min-height: 120px;
      resize: vertical;
    }

    .form__file {
      padding: 0.3rem 0.2rem;
    }

    .form__row {
      display: grid;
      gap: 0.75rem;

      &--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .form__row--3 {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .form__actions {
      display: flex;
      justify-content: flex-end;
    }

    /* Buttons */

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease;

      &--block {
        width: 100%;
        justify-content: center;
      }

      &--primary {
        background-color: #2563eb;
        color: #ffffff;
        border-color: #2563eb;
        box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);

        &:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
      }

      &--secondary {
        background-color: #ffffff;
        color: #111827;
        border-color: #d1d5db;

        &:hover {
          background-color: #f3f4f6;
        }
      }

      &--ghost {
        background-color: transparent;
        border-color: #e5e7eb;
        color: #374151;

        &:hover {
          background-color: #f3f4f6;
        }
      }

      &--danger {
        background-color: #dc2626;
        color: #ffffff;
        border-color: #dc2626;

        &:hover {
          background-color: #b91c1c;
          border-color: #b91c1c;
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: default;
        box-shadow: none;
      }
    }

    /* Result console */

    .result {
      margin-top: 0.5rem;
    }

    .result__title {
      margin: 0 0 0.25rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #4b5563;
    }

    .result__pre {
      margin: 0;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background-color: #111827;
      color: #e5e7eb;
      font-size: 0.8rem;
      max-height: 260px;
      overflow: auto;
    }
  `]
})
export class PanelComponent {
  private fb = inject(FormBuilder);
  private tasks = inject(TaskService);

  tab: 'tasks' | 'generate' | 'sections' | 'exams' = 'tasks';
  lastResult: any = null;

  // Forms
  createForm = this.fb.nonNullable.group({ model: ['', Validators.required] });
  updateForm = this.fb.nonNullable.group({ model: ['', Validators.required] });
  findForm = this.fb.nonNullable.group({ id: [''] });
  deleteForm = this.fb.nonNullable.group({ id: [''] });
  gradeForm = this.fb.nonNullable.group({ grade: [''] });

  generateForm = this.fb.nonNullable.group({ subject: [''], grade: [''], count: [1]});

  sectionAddForm = this.fb.nonNullable.group({ section: [''] });
  sectionGetForm = this.fb.nonNullable.group({ sectionId: [''] });
  sectionDeleteForm = this.fb.nonNullable.group({ sectionId: [''] });

  existTaskForm = this.fb.nonNullable.group({ taskId: [''] });
  checkExamForm = this.fb.nonNullable.group({ examId: [''], taskExamId: [''], answer: [''] });
  finishExamForm = this.fb.nonNullable.group({ examId: [''] });
  resultByUserForm = this.fb.nonNullable.group({ userId: [''] });

  createFile: File | null = null;
  updateFile: File | null = null;

  onFileSelect(ev: Event, type: 'create' | 'update') {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    if (type === 'create') this.createFile = file; else this.updateFile = file;
  }

  parseJson(s: string): any { try { return JSON.parse(s); } catch { return {}; } }

  loadMyTasks() { this.tasks.getMyTasks().subscribe(r => this.lastResult = r); }
  loadAllTasks() { this.tasks.getAllTasks().subscribe(r => this.lastResult = r); }

  onCreate() {
    const model = this.parseJson(this.createForm.value.model || '{}');
    if (!this.createFile) return;
    this.tasks.createTask(model, this.createFile).subscribe(r => this.lastResult = r);
  }

  onUpdate() {
    const model = this.parseJson(this.updateForm.value.model || '{}');
    if (!this.updateFile) return;
    this.tasks.updateTask(model as any, this.updateFile).subscribe(r => this.lastResult = r);
  }

  onFindById() {
    const id = this.findForm.value.id || '';
    if (!id) return;
    this.tasks.getTaskById(id).subscribe(r => this.lastResult = r);
  }

  onFindByGrade() {
    const grade = this.gradeForm.value.grade || '';
    if (!grade) return;
    this.tasks.getAllTasksByGrade(grade).subscribe(r => this.lastResult = r);
  }

  onDelete() {
    const id = this.deleteForm.value.id || '';
    if (!id) return;
    this.tasks.deleteTask(id).subscribe(r => this.lastResult = { deleted: id });
  }

  onGenerate() {
    const val = this.generateForm.getRawValue();
    this.tasks.generateTask(val).subscribe(r => this.lastResult = r);
  }

  onAddSection() {
    const section = this.sectionAddForm.value.section || '';
    if (!section) return;
    this.tasks.addSection(section).subscribe(r => this.lastResult = r);
  }

  onGetSection() {
    const sectionId = this.sectionGetForm.value.sectionId || '';
    if (!sectionId) return;
    this.tasks.getSection(sectionId).subscribe(r => this.lastResult = r);
  }

  onGetAllSections() {
    this.tasks.getAllSections().subscribe(r => this.lastResult = r);
  }

  onDeleteSection() {
    const sectionId = this.sectionDeleteForm.value.sectionId || '';
    if (!sectionId) return;
    this.tasks.deleteSection(sectionId).subscribe(() => this.lastResult = { deletedSection: sectionId });
  }

  onGetByExamExistTaskId() {
    const taskId = this.existTaskForm.value.taskId || '';
    if (!taskId) return;
    this.tasks.getByExamExistTaskId(taskId).subscribe(r => this.lastResult = r);
  }

  onGetAllExamExist() {
    this.tasks.getAllExamExist().subscribe(r => this.lastResult = r);
  }

  onCheckExam() {
    const v = this.checkExamForm.getRawValue();
    this.tasks.checkResultExam(v.examId || '', v.taskExamId || '', v.answer || '')
      .subscribe(r => this.lastResult = r);
  }

  onFetchPendingExam() {
    this.tasks.fetchPendingExam().subscribe(r => this.lastResult = r);
  }

  onFinishExam() {
    const v = this.finishExamForm.getRawValue();
    if (!v.examId) return;
    this.tasks.finishExam(v.examId).subscribe(r => this.lastResult = r);
  }

  onGetAllResultExamByUser() {
    const v = this.resultByUserForm.getRawValue();
    if (!v.userId) return;
    this.tasks.getAllResultExamByUser(v.userId).subscribe(r => this.lastResult = r);
  }
}

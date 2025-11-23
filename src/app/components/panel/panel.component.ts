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
    <h1>Task Panel</h1>
    <nav class="tabs">
      <button (click)="tab='tasks'" [class.active]="tab==='tasks'">Tasks</button>
      <button (click)="tab='generate'" [class.active]="tab==='generate'">Generate</button>
      <button (click)="tab='sections'" [class.active]="tab==='sections'">Sections</button>
      <button (click)="tab='exams'" [class.active]="tab==='exams'">Exams</button>
    </nav>

    <section *ngIf="tab==='tasks'">
      <h2>My Tasks</h2>
      <button (click)="loadMyTasks()">Load My Tasks</button>
      <button (click)="loadAllTasks()">Load All</button>
      <div class="row">
        <div>
          <h3>Create Task</h3>
          <form [formGroup]="createForm" (ngSubmit)="onCreate()">
            <label>Model JSON</label>
            <textarea formControlName="model" rows="4" placeholder='{"title":"Sample"}'></textarea>
            <label>File</label>
            <input type="file" (change)="onFileSelect($event, 'create')" />
            <button type="submit" [disabled]="createForm.invalid || !createFile">Create</button>
          </form>
        </div>
        <div>
          <h3>Update Task</h3>
          <form [formGroup]="updateForm" (ngSubmit)="onUpdate()">
            <label>Model JSON (must contain id)</label>
            <textarea formControlName="model" rows="4" placeholder='{"id":"..."}'></textarea>
            <label>File</label>
            <input type="file" (change)="onFileSelect($event, 'update')" />
            <button type="submit" [disabled]="updateForm.invalid || !updateFile">Update</button>
          </form>
        </div>
        <div>
          <h3>Find Task</h3>
          <form [formGroup]="findForm" (ngSubmit)="onFindById()">
            <input formControlName="id" placeholder="Task ID" />
            <button type="submit">Get by ID</button>
          </form>
          <form [formGroup]="gradeForm" (ngSubmit)="onFindByGrade()">
            <input formControlName="grade" placeholder="Grade" />
            <button type="submit">Get by Grade</button>
          </form>
          <form [formGroup]="deleteForm" (ngSubmit)="onDelete()">
            <input formControlName="id" placeholder="Task ID" />
            <button type="submit">Delete</button>
          </form>
        </div>
      </div>

      <pre>{{ lastResult | json }}</pre>
    </section>

    <section *ngIf="tab==='generate'">
      <h2>Generate Tasks</h2>
      <form [formGroup]="generateForm" (ngSubmit)="onGenerate()">
        <input formControlName="subject" placeholder="Subject" />
        <input formControlName="grade" placeholder="Grade" />
        <input formControlName="count" type="number" placeholder="Count" />
        <button type="submit">Generate</button>
      </form>
      <pre>{{ lastResult | json }}</pre>
    </section>

    <section *ngIf="tab==='sections'">
      <h2>Sections</h2>
      <div class="row">
        <div>
          <form [formGroup]="sectionAddForm" (ngSubmit)="onAddSection()">
            <input formControlName="section" placeholder="Section name" />
            <button type="submit">Add Section</button>
          </form>
          <form [formGroup]="sectionGetForm" (ngSubmit)="onGetSection()">
            <input formControlName="sectionId" placeholder="Section ID" />
            <button type="submit">Get Section</button>
          </form>
          <form [formGroup]="sectionDeleteForm" (ngSubmit)="onDeleteSection()">
            <input formControlName="sectionId" placeholder="Section ID" />
            <button type="submit">Delete Section</button>
          </form>
          <button (click)="onGetAllSections()">Get All Sections</button>
        </div>
      </div>
      <pre>{{ lastResult | json }}</pre>
    </section>

    <section *ngIf="tab==='exams'">
      <h2>Exams</h2>
      <div class="row">
        <div>
          <form [formGroup]="existTaskForm" (ngSubmit)="onGetByExamExistTaskId()">
            <input formControlName="taskId" placeholder="Exist Task ID" />
            <button type="submit">Get By Exam Exist TaskId</button>
          </form>
          <button (click)="onGetAllExamExist()">Get All Exist Exams</button>
        </div>
        <div>
          <form [formGroup]="checkExamForm" (ngSubmit)="onCheckExam()">
            <input formControlName="examId" placeholder="Exam ID" />
            <input formControlName="taskExamId" placeholder="Task Exam ID" />
            <input formControlName="answer" placeholder="Answer" />
            <button type="submit">Check Result</button>
          </form>
          <button (click)="onFetchPendingExam()">Fetch Pending Exam</button>
          <form [formGroup]="finishExamForm" (ngSubmit)="onFinishExam()">
            <input formControlName="examId" placeholder="Exam ID" />
            <button type="submit">Finish Exam</button>
          </form>
          <form [formGroup]="resultByUserForm" (ngSubmit)="onGetAllResultExamByUser()">
            <input formControlName="userId" placeholder="User ID" />
            <button type="submit">Get Results by User</button>
          </form>
        </div>
      </div>
      <pre>{{ lastResult | json }}</pre>
    </section>
  </div>
  `,
  styles: [`
    .panel{padding:16px}
    .tabs{display:flex;gap:8px;margin-bottom:16px}
    .tabs button.active{font-weight:bold;text-decoration:underline}
    .row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    textarea{width:100%}
    input, textarea{display:block;margin:6px 0;padding:6px}
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

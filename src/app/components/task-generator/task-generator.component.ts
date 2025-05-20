import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-task-generator',
  standalone: true,
  imports: [],
  templateUrl: './task-generator.component.html',
  styleUrl: './task-generator.component.scss'
})
export class TaskGeneratorComponent {

  @Output() navigate = new EventEmitter<string>();

  goToControlMeu() {
    this.navigate.emit('controlMenu');
  }
}

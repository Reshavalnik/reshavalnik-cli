import {Component, EventEmitter, Output} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-type-editor',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './type-editor.component.html',
  styleUrl: './type-editor.component.scss'
})
export class TypeEditorComponent {

  @Output() navigate = new EventEmitter<string>();

  goToControlMeu() {
    this.navigate.emit('controlMenu');
  }
}

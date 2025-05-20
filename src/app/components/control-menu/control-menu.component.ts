import {Component, EventEmitter, Output} from '@angular/core';
import {NgForOf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-control-menu',
  standalone: true,
  imports: [
    NgStyle,
    NgForOf
  ],
  templateUrl: './control-menu.component.html',
  styleUrl: './control-menu.component.scss'
})
export class ControlMenuComponent {

  @Output() navigate = new EventEmitter<string>();

  courses = [
    {
      category: 'Едитор',
      categoryColor: '#151313',
      title: 'Създаване на тип математическа задача',
      progress: '5/20 lessons',
      color: '#FEE684',
      componentName: 'typeEditor'
    },
    {
      category: 'Едитор',
      categoryColor: '#fccc42',
      title: 'Генериране на математически задачи',
      progress: '12/50 lessons',
      color: '#E9D2FC',
      componentName: 'taskGenerator'
    },
    {
      category: 'Запазени',
      categoryColor: '#be94f5',
      title: 'Запазени задачи',
      progress: '18/22 lessons',
      color: '#BEEBFE'
    }
  ];

  lessons = [
    {
      title: 'Умножение на прости числа',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Делене на прости числа',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Пресмятане на корен квадратен',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Събиране на прости числа',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Изваждане на прости числа',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Пресмятане на дробни числа',
      subtitle: 'dsofjdsjlksdf.py'
    },
    {
      title: 'Намиране обиколко на триъгълник',
      subtitle: 'dsofjdsjlksdf.py'
    }
  ];

  goToTypeEditor(componentName: string | undefined) {
    if (componentName) {
      this.navigate.emit(componentName);
    }
  }
}

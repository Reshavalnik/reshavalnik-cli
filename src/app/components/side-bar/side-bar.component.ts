import { Component } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {

  isCollapsed = true;

  activeIndex = 0;

  icons = [
    { class: 'fa-solid fa-house', label: 'Начало' },
    { class: 'fa-solid fa-users', label: 'Потребители' },
    { class: 'fa-solid fa-sliders', label: 'Настройки' }
  ];

  toggleCollapse(state: boolean) {
    this.isCollapsed = state;
  }

  setActive(index: number) {
    this.activeIndex = index;
  }
}

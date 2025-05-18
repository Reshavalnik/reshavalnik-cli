import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {

  isCollapsed = true;

  activeIndex = 0;

  icons = [
    'far fa-folder',
    'far fa-pen-to-square',
    'far fa-calendar',
    'far fa-comments',
    'far fa-circle-play',
    'far fa-circle'
  ];

  toggleCollapse(state: boolean) {
    this.isCollapsed = state;
  }

  setActive(index: number) {
    this.activeIndex = index;
  }
}

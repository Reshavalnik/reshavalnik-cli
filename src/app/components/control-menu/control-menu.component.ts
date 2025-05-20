import {Component} from '@angular/core';
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

  courses = [
    {
      category: 'Marketing',
      title: 'Creative Writing for Beginners',
      progress: '5/20 lessons',
      avatarCount: 120,
      color: '#FEE684'
    },
    {
      category: 'Computer Science',
      title: 'Digital Illustration with Adobe Illustrator',
      progress: '12/50 lessons',
      avatarCount: 80,
      color: '#E9D2FC'
    },
    {
      category: 'Psychology',
      title: 'Public Speaking and Leadership',
      progress: '18/22 lessons',
      avatarCount: 24,
      color: '#BEEBFE'
    }
  ];

  lessons = [
    {
      title: 'Introduction to Creative Writing',
      subtitle: 'Creative writing for beginners',
      teacher: 'Conner Garcia',
      duration: '22 min'
    },
    {
      title: 'Foundations of Public Speaking',
      subtitle: 'Public Speaking and Leadership',
      teacher: 'Saira Goodman',
      duration: '40 min'
    },
    {
      title: 'Getting to know the tool Adobe Illustrator',
      subtitle: 'Digital Illustration with Adobe Illustrator',
      teacher: 'Tony Ware',
      duration: '1h 08 min'
    },
    {
      title: 'Understanding audience psychology',
      subtitle: 'Public Speaking: Basic course',
      teacher: 'Mya Guzman',
      duration: '26 min'
    },
    {
      title: 'The importance of self reflection',
      subtitle: 'Psychology of influence',
      teacher: 'Zohaib Osborn',
      duration: '23 min'
    },
  ];

  getProgressRatio(progress: string): number {
    const [current, total] = progress.split('/').map(Number);
    return total > 0 ? current / total : 0;
  }
}

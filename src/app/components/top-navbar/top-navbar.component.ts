import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgForOf
  ],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss'
})
export class TopNavbarComponent {

  navItems = [
    { label: 'Начало', route: '/home', active: 'true'},
    { label: 'Вход/Регистрация', route: '/login', active: 'true'},
    { label: 'Контакти', route: '/contacts', active: 'true' }
    // ,
    // { label: 'About Us', route: '/about-us', active: false },
    // { label: 'Prices', route: '/prices', active: false }
  ];
}

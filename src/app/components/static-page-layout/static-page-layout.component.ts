import { Component } from '@angular/core';
import {TopNavbarComponent} from '../top-navbar/top-navbar.component';

@Component({
  selector: 'app-static-page-layout',
  standalone: true,
  imports: [
    TopNavbarComponent
  ],
  templateUrl: './static-page-layout.component.html',
  styleUrl: './static-page-layout.component.scss'
})
export class StaticPageLayoutComponent {

}

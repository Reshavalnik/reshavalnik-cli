import { Component } from '@angular/core';
import {StaticPageLayoutComponent} from '../../components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    StaticPageLayoutComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}

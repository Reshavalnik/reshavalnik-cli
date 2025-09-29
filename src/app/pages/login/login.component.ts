import { Component } from '@angular/core';
import {StaticPageLayoutComponent} from '../../components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    StaticPageLayoutComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}

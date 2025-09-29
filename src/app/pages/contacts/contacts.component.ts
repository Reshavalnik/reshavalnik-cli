import { Component } from '@angular/core';
import {StaticPageLayoutComponent} from '../../components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    StaticPageLayoutComponent
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

}

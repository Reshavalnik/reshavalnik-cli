import { Component } from '@angular/core';
import {SideBarComponent} from '../../components/side-bar/side-bar.component';
import {ControlMenuComponent} from '../../components/control-menu/control-menu.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    SideBarComponent,
    ControlMenuComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}

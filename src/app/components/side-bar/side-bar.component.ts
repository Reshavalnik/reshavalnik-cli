import {AfterViewInit, Component, ComponentRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {NgComponentOutlet, NgForOf, NgIf} from '@angular/common';
import {TypeEditorComponent} from '../type-editor/type-editor.component';
import {ControlMenuComponent} from '../control-menu/control-menu.component';
import {Router} from '@angular/router';
import {TaskGeneratorComponent} from '../task-generator/task-generator.component';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgComponentOutlet
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent implements AfterViewInit {

  @ViewChild('dynamicContent', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;

  componentsMap: Record<string, Type<any>> = {
    controlMenu: ControlMenuComponent,
    typeEditor: TypeEditorComponent,
    taskGenerator: TaskGeneratorComponent
  };

  activeContentKey: string = 'controlMenu';

  activeComponentRef: ComponentRef<any> | null = null;

  isCollapsed = true;

  activeIndex = 0;

  icons = [
    { class: 'fa-solid fa-house', label: 'Начало', route: '/admin' },
    { class: 'fa-solid fa-users', label: 'Потребители', route: '/admin/users' },
    { class: 'fa-solid fa-sliders', label: 'Настройки', route: '/admin/settings' }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.loadComponent(this.activeContentKey);
  }

  toggleCollapse(state: boolean) {
    this.isCollapsed = state;
  }

  setActive(index: number) {
    this.activeIndex = index;
    const route = this.icons[index]?.route;
    if (route) {
      this.router.navigate([route]);
    }
  }

  onNavigate(key: string) {
    this.activeContentKey = key;
    this.loadComponent(key);
  }

  loadComponent(key: string) {
    this.viewContainerRef.clear();
    const component = this.componentsMap[key];

    if (component) {
      const ref = this.viewContainerRef.createComponent(component);
      this.activeComponentRef = ref;

      if (ref.instance.navigate) {
        ref.instance.navigate.subscribe((value: string) => this.onNavigate(value));
      }
    }
  }
}

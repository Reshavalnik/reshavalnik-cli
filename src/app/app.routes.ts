import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(mod => mod.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];

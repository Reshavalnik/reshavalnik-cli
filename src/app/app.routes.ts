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
    path: 'home',
    loadComponent: () => import('./pages/landing-page/landing-page.component').then(mod => mod.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contacts/contacts.component').then(mod => mod.ContactsComponent)
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/about-us/about-us.component').then(mod => mod.AboutUsComponent)
  },
  {
    path: 'prices',
    loadComponent: () => import('./pages/prices/prices.component').then(mod => mod.PricesComponent)
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];

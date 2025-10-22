import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  { path: 'auth', component: AuthComponent },
  { path: 'auth/callback', component: AuthCallbackComponent }
];

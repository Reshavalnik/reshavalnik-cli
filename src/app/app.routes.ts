import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { PanelComponent } from './components/panel/panel.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  },
  { path: 'auth', component: AuthComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'panel', component: PanelComponent }
];

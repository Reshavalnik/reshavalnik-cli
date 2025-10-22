import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { GoogleLoginButtonComponent } from '../google-login-button/google-login-button.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, GoogleLoginButtonComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private tokens = inject(TokenStorageService);
  private router = inject(Router);

  mode: 'login' | 'register' = 'register';
  loading = false;
  error: string | null = null;
  passwordVisible = false;

  loginForm = this.fb.nonNullable.group({
    usernameOrEmail: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = null;
  }

  onSubmit() {
    this.error = null;
    this.loading = true;
    if (this.mode === 'login') {
      const payload = this.loginForm.getRawValue();
      this.auth.login(payload).subscribe({
        next: res => this.handleAuthSuccess(res.accessToken, res.user),
        error: err => this.handleError(err),
        complete: () => (this.loading = false)
      });
    } else {
      const payload = this.registerForm.getRawValue();
      this.auth.register(payload).subscribe({
        next: res => this.handleAuthSuccess(res.accessToken, res.user),
        error: err => this.handleError(err),
        complete: () => (this.loading = false)
      });
    }
  }

  handleAuthSuccess(token?: string, user?: any) {
    if (token) this.tokens.setToken(token);
    if (user) this.tokens.setUser(user);
    this.router.navigateByUrl('/');
  }

  handleError(err: any) {
    console.error(err);
    this.error = err?.error?.message || err?.message || 'Authentication failed';
    this.loading = false;
  }

  socialLogin(provider: 'google' | 'facebook') {
    const url = this.auth.getSocialLoginUrl(provider);
    window.location.href = url;
  }

  peekPassword() {
    this.passwordVisible = !this.passwordVisible;
  }
}

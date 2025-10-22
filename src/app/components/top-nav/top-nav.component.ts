import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  private tokens = inject(TokenStorageService);
  private router = inject(Router);

  get isAuth(): boolean {
    return this.tokens.isAuthenticated;
  }

  logout() {
    this.tokens.clearAll();
    this.router.navigate(['/auth']);
  }
}

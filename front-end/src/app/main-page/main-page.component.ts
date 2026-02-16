import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalComponent } from '../auth/auth-modal/auth-modal.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [AuthModalComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('900ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MainPageComponent {
  showAuthModal = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleAuthModal() {
    this.showAuthModal = !this.showAuthModal;
  }

  startTracking() {
    // ✅ revisa si el usuario está logueado usando AuthService
    if (!this.authService.isLoggedIn()) {
      this.toggleAuthModal(); // abre modal si no está logueado
      return;
    }

    // si está logueado, navega
    this.router.navigate(['/home']);
  }
}

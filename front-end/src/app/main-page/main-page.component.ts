import { Component, OnInit } from '@angular/core';
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
export class MainPageComponent implements OnInit {
  showAuthModal = false;
  isChecking = true;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.isChecking = false;
    }
  }

  toggleAuthModal() {
    this.showAuthModal = !this.showAuthModal;
  }

  onLoginSuccess() {
    this.isChecking = true;
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  startTracking() {
    if (!this.authService.isLoggedIn()) {
      this.toggleAuthModal();
      return;
    }
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
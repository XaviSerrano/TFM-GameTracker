import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {

  @Output() close = new EventEmitter<void>()

  email = '';
  password = '';
  username = '';
  isLoginMode = true;
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.message = '';
    if (isLogin) this.username = '';
  }

onSubmit() {
  if (this.isLoginMode) {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.message = '✅ Login successful!';
        this.cd.markForCheck();
        setTimeout(() => this.close.emit(), 800);
        setTimeout(() => this.router.navigate(['/home']), 800);
      },
      error: () => this.message = '❌ Invalid credentials'
    });
  } else {
    this.authService.register(this.email, this.password, this.username).subscribe({
      next: () => {
        this.message = '✅ Account created! You can log in now.',
        setTimeout(() => {
          this.isLoginMode = true;
          this.username = '';
        }, 1500);
      },
      error: err => {
        console.error('REGISTER ERROR:', err);
        this.message = err?.error?.message || '❌ Registration failed';
      }
    });
  }
}

}

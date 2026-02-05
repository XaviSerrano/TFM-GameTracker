import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
// import { AuthService } from '../../../../auth/auth.service'; // Cambiar
import { UserService } from '../../../../services/user.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {
  email = '';
  newEmail = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) return;
      this.email = user.email;
      this.newEmail = user.email;
    });
  }

  updateEmail() {
    this.userService.updateEmail(this.newEmail).subscribe({
      next: updatedUser => {
        this.authService.updateCurrentUser({ email: updatedUser.email });
        this.alertService.show('EMAIL_UPDATED_SUCCESSFULLY');
      },
      error: err => console.error('Email cannot be updated:', err)
    });
  }

  hasChanges(): boolean {
    return this.email !== this.newEmail;
  }
}

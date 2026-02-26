import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  sent = false;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.email) return;
    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.sent = true;
          this.loading = false;
        },
        error: () => {
          this.error = 'Ha ocurrido un error. Inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }
}
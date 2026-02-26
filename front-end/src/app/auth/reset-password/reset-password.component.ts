import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirm = '';
  loading = false;
  success = false;
  error = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.error = 'Token inválido o expirado.';
    }
  }

  submit() {
    if (!this.password || this.password !== this.confirm) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      password: this.password
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Token inválido o expirado.';
        this.loading = false;
      }
    });
  }
}
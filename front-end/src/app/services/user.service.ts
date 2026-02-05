import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';
import { AuthService } from '../auth/auth.service'; // Cambiar
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfileFormData(formData: FormData): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, formData, { headers });
  }


  updateUsernameProfile(username: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, { username }, {
      headers: this.getAuthHeaders()
    });
  }

  updateEmail(email: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, { email }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // Barra búsqueda usuarios
  searchUsers(query: string = ''): Observable<any[]> {
    const q = query.trim();
    if (!q) {
      return this.http.get<any[]>(`${this.apiUrl}/user/all`, {
        headers: this.getAuthHeaders()
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/user/search?q=${q}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Click en usuario para ver perfil
  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/username/${username}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Recoger ratings
  getUserRatings(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/ratings/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }


}

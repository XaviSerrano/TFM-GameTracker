import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/profile`);
  }

  updateProfileFormData(formData: FormData): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, formData);
  }

  updateUsernameProfile(username: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, { username });
  }

  updateEmail(email: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, { email });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/profile`);
  }

  // Búsqueda de usuarios
  searchUsers(query: string = ''): Observable<any[]> {
    const q = query.trim();
    const url = q
      ? `${this.apiUrl}/user/search?q=${q}`
      : `${this.apiUrl}/user/all`;

    return this.http.get<any[]>(url);
  }

  // Perfil público por username
  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/username/${username}`);
  }

  // Ratings del usuario
  getUserRatings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ratings/user/${userId}`);
  }
}

import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';

export interface User {
  username: string;
  email: string;
  displayName?: string;
  profileImage?: string | null;
}

interface LoginResponse {
  access_token: string;
  username: string;
  email: string;
  displayName?: string;
  profileImage?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  /** USER STATE **/
  private userSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.userSubject.asObservable();

  /** TOKEN STATE **/
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =========================
  // STORAGE
  // =========================
  private loadUserFromStorage(): User | null {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const displayName = localStorage.getItem('displayName') || undefined;
    const profileImage = localStorage.getItem('profileImage') || undefined;

    if (username && email) {
      return {
        username,
        email,
        displayName,
        profileImage: profileImage || null
      };
    }
    return null;
  }

  private saveUserToStorage(user: User, token?: string) {
    if (token) {
      localStorage.setItem('token', token);
      this.tokenSubject.next(token);
    }

    localStorage.setItem('username', user.username);
    localStorage.setItem('email', user.email);

    if (user.displayName !== undefined) {
      localStorage.setItem('displayName', user.displayName || '');
    }

    if (user.profileImage) {
      localStorage.setItem('profileImage', user.profileImage);
    } else {
      localStorage.removeItem('profileImage');
    }

    this.userSubject.next(user);
  }

  // =========================
  // AUTH
  // =========================
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.saveUserToStorage(
          {
            username: res.username,
            email: res.email,
            displayName: res.displayName,
            profileImage: res.profileImage || null
          },
          res.access_token
        );
      }),
      catchError(err => {
        console.error('❌ LOGIN ERROR', err);
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, username }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('❌ REGISTER ERROR', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.clear(); // ← como el primer servicio
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  // =========================
  // GETTERS
  // =========================
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Compatibilidad con componentes antiguos */
  getUser(): User | null {
    return this.userSubject.value;
  }

  /** Nombre nuevo */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  // =========================
  // UPDATE USER
  // =========================
  updateCurrentUser(user: Partial<User>) {
    const current = this.userSubject.value;
    if (!current) return;

    const updatedUser = { ...current, ...user };
    this.saveUserToStorage(updatedUser);
  }

  // =========================
  // REFRESH PROFILE
  // =========================
  refreshUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/profile`).pipe(
      tap(profile => {
        if (profile) {
          this.updateCurrentUser({
            displayName: profile.displayName,
            profileImage: profile.profileImage
          });
        }
      })
    );
  }
}

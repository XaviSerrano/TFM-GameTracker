import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/home'], { replaceUrl: true });
    return false; // bloquea la carga del componente
  }
  return true; // permite cargar MainPage solo si NO está logueado
};
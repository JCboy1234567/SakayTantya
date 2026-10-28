import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && (user.role === 'user' || user.role === 'admin')) {
        return true;
      }
    } catch (e) {
      console.error('Error parsing user session', e);
    }
  }

  router.navigate(['/login-user']);
  return false;
};

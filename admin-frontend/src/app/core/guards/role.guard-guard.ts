import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      // Kukunin ang role na naka-set sa route data (halimbawa: data: { role: 'admin' })
      const expectedRole = route.data?.['role'];

      if (!expectedRole || user.role === expectedRole) {
        return true; // Pwedeng pumasok kung tugma ang role o walang role na nire-require
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
    }
  }

  // Kung walang user o hindi tugma ang role, i-redirect sa login
  router.navigate(['/login']);
  return false;
};

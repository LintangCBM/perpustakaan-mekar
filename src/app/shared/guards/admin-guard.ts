import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user-role.enum';
import { map, take, tap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      return !!user && user.role === UserRole.Staff;
    }),
    tap((isStaff) => {
      if (!isStaff) {
        router.navigate(['/akun']);
      }
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take, tap } from 'rxjs/operators';
import { UserRole } from '../../models/user-role.enum';

export const studentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      return !!user && user.role === UserRole.Student;
    }),
    tap((isStudent) => {
      if (!isStudent) {
        router.navigate(['/admin']);
      }
    })
  );
};

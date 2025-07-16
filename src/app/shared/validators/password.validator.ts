import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const konfirmasiPassword = control.get('konfirmasiPassword');

  const areMismatching =
    password &&
    konfirmasiPassword &&
    password.value !== konfirmasiPassword.value;
  return areMismatching ? { passwordsMismatch: true } : null;
}

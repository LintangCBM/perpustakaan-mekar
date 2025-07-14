import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const konfirmasiPassword = control.get('konfirmasiPassword');

  if (password?.value !== konfirmasiPassword?.value) {
    konfirmasiPassword?.setErrors({ passwordsMismatch: true });
    return { passwordsMismatch: true };
  } else {
    if (konfirmasiPassword?.hasError('passwordsMismatch')) {
      konfirmasiPassword.setErrors(null);
    }
  }

  return null;
}

import { UserRole } from './user-role.enum';

export interface User {
  id: number;
  nama: string;
  nisn: string;
  password_DO_NOT_STORE_IN_PRODUCTION: string;
  role: UserRole;
}

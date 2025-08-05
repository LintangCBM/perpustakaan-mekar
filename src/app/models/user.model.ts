import { UserRole } from './user-role.enum';

export interface User {
  uid: string;
  nama: string;
  nisn?: number;
  email: string;
  telepon?: string;
  role: UserRole;
  isArchived?: boolean;
}

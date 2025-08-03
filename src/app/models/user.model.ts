import { UserRole } from './user-role.enum';

export interface User {
  uid: string;
  nama: string;
  nisn: string;
  email?: string;
  telepon?: string;
  role: UserRole;
  isArchived?: boolean;
}

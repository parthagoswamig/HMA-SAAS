import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export type Role = 'super_admin' | 'admin' | 'staff' | 'patient' | 'guest';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

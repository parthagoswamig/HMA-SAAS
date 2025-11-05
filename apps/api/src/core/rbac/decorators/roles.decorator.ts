import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * Use this decorator to restrict access to routes based on user roles
 * 
 * @example
 * ```typescript
 * @Roles(UserRole.DOCTOR, UserRole.NURSE)
 * @Get('patients')
 * getPatients() {
 *   return this.patientsService.findAll();
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

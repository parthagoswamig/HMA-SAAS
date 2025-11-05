import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Decorator
 * Use this decorator to restrict access to routes based on user permissions
 * 
 * @example
 * ```typescript
 * @Permissions(Permission.VIEW_PATIENTS, Permission.UPDATE_PATIENTS)
 * @Put('patients/:id')
 * updatePatient(@Param('id') id: string) {
 *   return this.patientsService.update(id);
 * }
 * ```
 */
export const Permissions = (...permissions: Permission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Require All Permissions Decorator
 * Use this when user must have ALL specified permissions
 */
export const RequireAllPermissions = (...permissions: Permission[]) =>
  SetMetadata('require_all_permissions', { permissions, requireAll: true });

/**
 * Require Any Permission Decorator
 * Use this when user needs at least ONE of the specified permissions
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata('require_any_permission', { permissions, requireAll: false });

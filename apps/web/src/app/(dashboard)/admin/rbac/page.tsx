'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

export default function RbacAdminPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permission, setPermission] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const r: any = await apiFetch('/admin-rbac/roles');
      setRoles(r);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const attach = async (roleId: string) => {
    if (!permission.trim()) {
      alert('Please enter a permission name');
      return;
    }
    try {
      await apiFetch('/admin-rbac/attach-permission', {
        method: 'POST',
        body: JSON.stringify({ roleId, permission }),
      });
      setPermission('');
      refresh();
    } catch (error) {
      console.error('Failed to attach permission:', error);
      alert('Failed to attach permission');
    }
  };

  const detach = async (roleId: string, name: string) => {
    if (!confirm(`Remove permission "${name}"?`)) return;
    try {
      await apiFetch('/admin-rbac/detach-permission', {
        method: 'POST',
        body: JSON.stringify({ roleId, permission: name }),
      });
      refresh();
    } catch (error) {
      console.error('Failed to detach permission:', error);
      alert('Failed to remove permission');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">RBAC Management</h1>
        <p className="text-gray-600 mt-2">Manage roles and permissions</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Permission to Role
        </label>
        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., patient.create, user.update"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && roles.length > 0) {
                attach(roles[0].id);
              }
            }}
          />
          <span className="text-sm text-gray-500 self-center">
            Enter permission name and click "Attach" on a role
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border rounded-2xl p-6 shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                {role.description && (
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                )}
              </div>
              <button
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-colors"
                onClick={() => attach(role.id)}
              >
                Attach Permission
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Permissions ({role.rolePermissions?.length || 0}):
              </div>
              <div className="flex flex-wrap gap-2">
                {role.rolePermissions && role.rolePermissions.length > 0 ? (
                  role.rolePermissions.map((rp: any) => (
                    <span
                      key={rp.permissionId}
                      className="inline-flex items-center px-3 py-1 rounded-full border bg-blue-50 border-blue-200 text-blue-700 text-xs font-medium"
                    >
                      {rp.permission?.name}
                      <button
                        className="ml-2 text-red-600 hover:text-red-800 font-bold"
                        onClick={() => detach(role.id, rp.permission?.name)}
                        title="Remove permission"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No permissions assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No roles found. Please create roles first.</p>
        </div>
      )}
    </div>
  );
}

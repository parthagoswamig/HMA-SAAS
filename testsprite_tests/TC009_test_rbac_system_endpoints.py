import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Example credentials for SUPER_ADMIN user to test RBAC endpoints
SUPER_ADMIN_CREDENTIALS = {
    "email": "superadmin@example.com",
    "password": "SuperAdminPass123!"
}

def get_auth_token():
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=SUPER_ADMIN_CREDENTIALS, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("accessToken")
        assert token, "Login response missing accessToken"
        return token
    except RequestException as e:
        raise AssertionError(f"Failed to obtain auth token: {e}")

def test_rbac_system_endpoints():
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    created_role_id = None

    try:
        # 1. GET /rbac/roles - Validate roles list retrieval & DB connection
        resp = requests.get(f"{BASE_URL}/rbac/roles", headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"GET /rbac/roles failed with status {resp.status_code}"
        roles = resp.json()
        assert isinstance(roles, list), "Roles response is not a list"

        # 2. POST /rbac/roles - Create a new role
        new_role_data = {
            "name": "test_role_tc009",
            "description": "Role created for TC009 testing"
        }
        resp = requests.post(f"{BASE_URL}/rbac/roles", headers=headers, json=new_role_data, timeout=TIMEOUT)
        assert resp.status_code == 201, f"POST /rbac/roles failed with status {resp.status_code}"
        role_created = resp.json()
        created_role_id = role_created.get("id")
        assert created_role_id, "Created role missing ID"

        # 3. GET /rbac/permissions - Retrieve permissions & validate schema
        resp = requests.get(f"{BASE_URL}/rbac/permissions", headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"GET /rbac/permissions failed with status {resp.status_code}"
        permissions = resp.json()
        assert isinstance(permissions, list), "Permissions response is not a list"
        assert all("id" in p and "name" in p for p in permissions), "Permission objects missing fields"

        if not permissions:
            raise AssertionError("No permissions found in the system to assign")

        # 4. POST /rbac/roles/:id/permissions - Assign permissions to the created role
        permission_ids = [p["id"] for p in permissions[:2]]  # assign first two permissions for test
        assign_payload = {"permissionIds": permission_ids}
        resp = requests.post(f"{BASE_URL}/rbac/roles/{created_role_id}/permissions", headers=headers, json=assign_payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"POST /rbac/roles/{created_role_id}/permissions failed with status {resp.status_code}"
        assigned = resp.json()
        assigned_permission_ids = assigned.get("permissionIds") or assigned.get("permissions")
        # Depending on implementation, validate assigned permissions
        if assigned_permission_ids:
            assert set(permission_ids).issubset(set(assigned_permission_ids)), "Not all permissions assigned correctly"

        # RBAC permission check: Try accessing roles endpoint with a non-privileged token (simulate DOCTOR)
        doctor_credentials = {
            "email": "doctoruser@example.com",
            "password": "DoctorPass123!"
        }
        # Get doctor token
        resp = requests.post(f"{BASE_URL}/auth/login", json=doctor_credentials, timeout=TIMEOUT)
        if resp.status_code == 200:
            doctor_token = resp.json().get("accessToken")
            if doctor_token:
                doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
                resp_doctor = requests.get(f"{BASE_URL}/rbac/roles", headers=doctor_headers, timeout=TIMEOUT)
                # Expected: Forbidden or Unauthorized if RBAC enforced
                assert resp_doctor.status_code in (401, 403), "Non-privileged role should not access /rbac/roles"
        # else: pass silently as doctor user may not exist, focusing main test on SUPER_ADMIN

    finally:
        # Cleanup: delete the created role if any
        if created_role_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/rbac/roles/{created_role_id}", headers=headers, timeout=TIMEOUT)
                # Accept 200 OK or 204 No Content for successful deletion
                assert del_resp.status_code in (200, 204), f"Failed to delete role {created_role_id}"
            except Exception:
                pass

test_rbac_system_endpoints()

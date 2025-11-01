import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Sample SUPER_ADMIN credentials (adjust if necessary)
SUPER_ADMIN_CREDENTIALS = {
    "email": "superadmin@testhospital.com",
    "password": "SuperAdminPass123!"
}

# Sample staff data for creation
STAFF_CREATE_PAYLOAD = {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe.staff@testhospital.com",
    "phone": "+1234567890",
    "role": "DOCTOR",
    "department": "Cardiology",
    "shift": "morning",
    "schedule": {
        "monday": "08:00-16:00",
        "tuesday": "08:00-16:00",
        "wednesday": "08:00-16:00",
        "thursday": "08:00-16:00",
        "friday": "08:00-16:00"
    }
}

UPDATED_STAFF_PAYLOAD = {
    "phone": "+1234509876",
    "shift": "evening",
    "schedule": {
        "monday": "14:00-22:00",
        "tuesday": "14:00-22:00",
        "wednesday": "14:00-22:00",
        "thursday": "14:00-22:00",
        "friday": "14:00-22:00"
    }
}

def test_staff_management_endpoints():
    # Authenticate as SUPER_ADMIN to get JWT token for RBAC
    auth_url = f"{BASE_URL}/auth/login"
    try:
        auth_resp = requests.post(auth_url, json=SUPER_ADMIN_CREDENTIALS, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Login failed with status {auth_resp.status_code} and body {auth_resp.text}"
        token = auth_resp.json().get("accessToken")
        assert token, "No accessToken returned on login"
    except requests.exceptions.RequestException as e:
        assert False, f"Authentication request failed: {str(e)}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    staff_id = None

    try:
        # 1. Create a new staff member
        create_url = f"{BASE_URL}/staff"
        create_resp = requests.post(create_url, json=STAFF_CREATE_PAYLOAD, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Staff creation failed with status {create_resp.status_code} and body {create_resp.text}"
        staff_data = create_resp.json()
        staff_id = staff_data.get("id")
        assert staff_id, "Created staff record has no id"

        # 2. Retrieve the staff member by ID
        get_url = f"{BASE_URL}/staff/{staff_id}"
        get_resp = requests.get(get_url, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Staff retrieval failed with status {get_resp.status_code} and body {get_resp.text}"
        retrieved_staff = get_resp.json()
        assert retrieved_staff.get("email") == STAFF_CREATE_PAYLOAD["email"], "Retrieved email does not match created staff email"

        # 3. Update the staff member details (phone, shift, schedule)
        update_url = f"{BASE_URL}/staff/{staff_id}"
        update_resp = requests.put(update_url, json=UPDATED_STAFF_PAYLOAD, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Staff update failed with status {update_resp.status_code} and body {update_resp.text}"
        updated_staff = update_resp.json()
        assert updated_staff.get("phone") == UPDATED_STAFF_PAYLOAD["phone"], "Phone not updated correctly"
        assert updated_staff.get("shift") == UPDATED_STAFF_PAYLOAD["shift"], "Shift not updated correctly"
        assert updated_staff.get("schedule") == UPDATED_STAFF_PAYLOAD["schedule"], "Schedule not updated correctly"

        # 4. Get all staff list and check if created staff is present
        list_url = f"{BASE_URL}/staff"
        list_resp = requests.get(list_url, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Staff list retrieval failed with status {list_resp.status_code} and body {list_resp.text}"
        staff_list = list_resp.json()
        assert any(s.get("id") == staff_id for s in staff_list), "Created staff not found in staff list"

        # 5. RBAC validation: attempt unauthorized access with a lower role token
        # Register a RECEPTIONIST user and login to test RBAC permission limitation
        receptionist_reg_payload = {
            "email": "receptionist001@testhospital.com",
            "password": "Reception123!",
            "role": "RECEPTIONIST"
        }
        try:
            reg_resp = requests.post(f"{BASE_URL}/auth/register", json=receptionist_reg_payload, timeout=TIMEOUT)
            # 400 or 409 possible if user already exists, ignore those
            if reg_resp.status_code not in (201, 400, 409):
                assert False, f"Receptionist registration failed with {reg_resp.status_code}: {reg_resp.text}"
        except requests.exceptions.RequestException as e:
            assert False, f"Receptionist registration request failed: {str(e)}"

        login_receptionist_resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": receptionist_reg_payload["email"],
            "password": receptionist_reg_payload["password"]
        }, timeout=TIMEOUT)
        assert login_receptionist_resp.status_code == 200, f"Receptionist login failed {login_receptionist_resp.text}"
        receptionist_token = login_receptionist_resp.json().get("accessToken")
        assert receptionist_token, "No token returned for receptionist login"

        receptionist_headers = {
            "Authorization": f"Bearer {receptionist_token}",
            "Content-Type": "application/json"
        }

        # Receptionist tries to create staff - should be forbidden 403 or unauthorized 401
        resp_create_unauth = requests.post(create_url, json=STAFF_CREATE_PAYLOAD, headers=receptionist_headers, timeout=TIMEOUT)
        assert resp_create_unauth.status_code in (401, 403), "Receptionist should not create staff - permission issue"

        # Receptionist tries to update staff - should be forbidden
        resp_update_unauth = requests.put(update_url, json=UPDATED_STAFF_PAYLOAD, headers=receptionist_headers, timeout=TIMEOUT)
        assert resp_update_unauth.status_code in (401, 403), "Receptionist should not update staff - permission issue"

        # Receptionist tries to view staff list - may or may not have permission depending on RBAC config
        resp_list_unauth = requests.get(list_url, headers=receptionist_headers, timeout=TIMEOUT)
        # Permit 200 or forbidden 403 depending on config; assert no 500 or error
        assert resp_list_unauth.status_code in (200, 403, 401), "Unexpected error in receptionist staff list access"

        # 6. API endpoint validation - check for allowed methods and error for wrong methods

        # DELETE is not supported on /staff/:id - should return 405 Method Not Allowed
        resp_delete = requests.delete(update_url, headers=headers, timeout=TIMEOUT)
        assert resp_delete.status_code in (404, 405), "DELETE method should not be allowed on /staff/:id"

    finally:
        # Cleanup: Try to delete the created staff if delete endpoint exists in this system (not listed in PRD)
        # If no delete endpoint, ignore cleanup
        if staff_id:
            try:
                delete_url = f"{BASE_URL}/staff/{staff_id}"
                delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # Accept 204 No Content or 200 OK if delete supported
                if delete_resp.status_code not in (204, 200, 404, 405):
                    print(f"Warning: Unexpected delete status code {delete_resp.status_code} during cleanup")
            except requests.exceptions.RequestException:
                # Log but do not fail test on cleanup error
                pass

test_staff_management_endpoints()

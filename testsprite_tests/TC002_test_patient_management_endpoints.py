import requests
import traceback

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Assuming RBAC is enforced and JWT token is required for authorization.
# For the test, we authenticate as a user with "ADMIN" role to test patient management.
# Replace these credentials with valid test credentials in your environment.
AUTH_CREDENTIALS = {
    "username": "admin_user",
    "password": "admin_password"
}

def authenticate():
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json=AUTH_CREDENTIALS,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        token = resp.json().get("accessToken") or resp.json().get("access_token") or resp.json().get("token")
        assert token, "Authentication token not found in response"
        return token
    except Exception as e:
        raise RuntimeError(f"Authentication failed: {e}")

def test_patient_management_endpoints():
    token = None
    patient_id = None
    headers = None
    try:
        # Authenticate to get JWT token for RBAC
        token = authenticate()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # 1) Create a new patient (POST /patients)
        create_payload = {
            "firstName": "Test",
            "lastName": "Patient",
            "dateOfBirth": "1980-01-01",
            "gender": "Other",
            "contactNumber": "+1234567890",
            "email": "test.patient@example.com",
            "address": "123 Health St, Wellness City",
            "medicalHistory": ["Hypertension"]
        }
        create_resp = requests.post(f"{BASE_URL}/patients", json=create_payload, headers=headers, timeout=TIMEOUT)
        create_resp.raise_for_status()
        patient_data = create_resp.json()
        assert "id" in patient_data, f"Patient creation response missing 'id': {patient_data}"
        patient_id = patient_data["id"]

        # 2) Retrieve the patient (GET /patients/:id)
        get_resp = requests.get(f"{BASE_URL}/patients/{patient_id}", headers=headers, timeout=TIMEOUT)
        get_resp.raise_for_status()
        retrieved_patient = get_resp.json()
        assert retrieved_patient["id"] == patient_id, "Retrieved patient ID mismatch"
        # Validate data integrity
        for key in create_payload:
            # dateOfBirth might be returned in ISO format or unchanged
            if key == "dateOfBirth":
                assert retrieved_patient[key].startswith(create_payload[key]), f"Patient {key} mismatch"
            else:
                assert retrieved_patient.get(key) == create_payload[key], f"Patient {key} mismatch"

        # 3) Update patient record (PUT /patients/:id)
        update_payload = {
            "contactNumber": "+1987654321",
            "address": "456 Recovery Rd, Healthtown"
        }
        update_resp = requests.put(f"{BASE_URL}/patients/{patient_id}", json=update_payload, headers=headers, timeout=TIMEOUT)
        update_resp.raise_for_status()
        updated_patient = update_resp.json()
        for key, value in update_payload.items():
            assert updated_patient.get(key) == value, f"Patient update for {key} failed"

        # 4) Validate RBAC: Attempt accessing patient list with insufficient permissions (simulate DOCTOR role)
        # Authenticate as DOCTOR role user to test access control
        doctor_login_resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "doctor_user", "password": "doctor_password"},
            timeout=TIMEOUT
        )
        doctor_login_resp.raise_for_status()
        doctor_token = doctor_login_resp.json().get("accessToken") or doctor_login_resp.json().get("access_token") or doctor_login_resp.json().get("token")
        assert doctor_token, "Doctor authentication token missing"
        doctor_headers = {"Authorization": f"Bearer {doctor_token}", "Content-Type": "application/json"}

        # Test that DOCTOR role can access GET /patients/:id (allowed)
        doctor_get_resp = requests.get(f"{BASE_URL}/patients/{patient_id}", headers=doctor_headers, timeout=TIMEOUT)
        if doctor_get_resp.status_code == 200:
            doctor_patient = doctor_get_resp.json()
            assert doctor_patient["id"] == patient_id, "Doctor role: patient record fetch failed"
        else:
            # If RBAC denies, status should be 403 Forbidden
            assert doctor_get_resp.status_code == 403, f"Unexpected status for doctor GET patient: {doctor_get_resp.status_code}"

        # Test that DOCTOR role cannot delete patient (assuming only ADMIN/SUPER_ADMIN can delete)
        doctor_delete_resp = requests.delete(f"{BASE_URL}/patients/{patient_id}", headers=doctor_headers, timeout=TIMEOUT)
        assert doctor_delete_resp.status_code in [403, 401], f"Doctor role should not be able to delete patient, got {doctor_delete_resp.status_code}"

        # 5) Delete patient record (DELETE /patients/:id)
        delete_resp = requests.delete(f"{BASE_URL}/patients/{patient_id}", headers=headers, timeout=TIMEOUT)
        # Depending on implementation, 200 or 204 No Content is acceptable
        assert delete_resp.status_code in [200, 204], f"Patient deletion failed with status {delete_resp.status_code}"

        # Confirm deletion by trying to GET again
        get_after_delete_resp = requests.get(f"{BASE_URL}/patients/{patient_id}", headers=headers, timeout=TIMEOUT)
        assert get_after_delete_resp.status_code == 404, f"Deleted patient record still accessible, got {get_after_delete_resp.status_code}"

    except requests.exceptions.RequestException as re:
        # Handle connectivity issues (Database connectivity can manifest as 5xx)
        tb = traceback.format_exc()
        raise RuntimeError(f"HTTP Request failed: {re}\nTraceback:\n{tb}")
    except AssertionError as ae:
        raise AssertionError(f"Assertion failed: {ae}")
    except Exception as ex:
        tb = traceback.format_exc()
        raise RuntimeError(f"Unexpected error: {ex}\nTraceback:\n{tb}")
    finally:
        # Cleanup: Ensure patient is deleted if test fails before deletion step
        if headers and patient_id:
            try:
                requests.delete(f"{BASE_URL}/patients/{patient_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_patient_management_endpoints()
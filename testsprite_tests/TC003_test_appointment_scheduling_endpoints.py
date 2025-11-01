import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# For this test we assume we have a valid JWT token for a user with appropriate RBAC permissions
# In real case, fetch or configure securely
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token_for_testing_purposes"

HEADERS = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_appointment_scheduling_endpoints():
    # Create a new appointment resource first for testing get, put, and cleanup
    appointment_data = {
        "patientId": str(uuid.uuid4()),
        "doctorId": str(uuid.uuid4()),
        "scheduledAt": "2024-08-01T10:00:00Z",
        "reason": "Regular check-up"
    }
    appointment_id = None

    try:
        # Book appointment (POST /appointments)
        resp_post = requests.post(
            f"{BASE_URL}/appointments",
            headers=HEADERS,
            json=appointment_data,
            timeout=TIMEOUT
        )
        assert resp_post.status_code == 201, f"Expected 201 Created, got {resp_post.status_code}"
        post_resp_json = resp_post.json()
        assert "id" in post_resp_json, "Response missing appointment id after creation"
        appointment_id = post_resp_json["id"]

        # Retrieve the appointment (GET /appointments/:id)
        resp_get = requests.get(
            f"{BASE_URL}/appointments/{appointment_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_get.status_code == 200, f"Expected 200 OK on get appointment, got {resp_get.status_code}"
        get_resp_json = resp_get.json()
        assert get_resp_json["id"] == appointment_id, "Retrieved appointment id does not match"
        assert get_resp_json["patientId"] == appointment_data["patientId"], "Patient ID mismatch"
        assert get_resp_json["doctorId"] == appointment_data["doctorId"], "Doctor ID mismatch"

        # Update the appointment (PUT /appointments/:id)
        update_data = {
            "reason": "Updated reason for visit",
            "scheduledAt": "2024-08-01T11:00:00Z"
        }
        resp_put = requests.put(
            f"{BASE_URL}/appointments/{appointment_id}",
            headers=HEADERS,
            json=update_data,
            timeout=TIMEOUT
        )
        assert resp_put.status_code == 200, f"Expected 200 OK on update, got {resp_put.status_code}"
        put_resp_json = resp_put.json()
        assert put_resp_json["reason"] == update_data["reason"], "Update reason mismatch"
        assert put_resp_json["scheduledAt"] == update_data["scheduledAt"], "Update scheduledAt mismatch"

        # Get all appointments (GET /appointments)
        resp_list = requests.get(
            f"{BASE_URL}/appointments",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_list.status_code == 200, f"Expected 200 OK on get appointments list, got {resp_list.status_code}"
        list_resp_json = resp_list.json()
        assert isinstance(list_resp_json, list), "Appointments list response is not a list"
        # check that our appointment is present in the list
        assert any(appt["id"] == appointment_id for appt in list_resp_json), "Created appointment not found in appointments list"

        # Check calendar view (GET /appointments/calendar)
        resp_calendar = requests.get(
            f"{BASE_URL}/appointments/calendar",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_calendar.status_code == 200, f"Expected 200 OK on calendar view, got {resp_calendar.status_code}"
        calendar_json = resp_calendar.json()
        assert isinstance(calendar_json, dict), "Calendar view response should be an object/dict"

        # Check availability (GET /appointments/availability)
        params_avail = {"doctorId": appointment_data["doctorId"], "date": "2024-08-01"}
        resp_availability = requests.get(
            f"{BASE_URL}/appointments/availability",
            headers=HEADERS,
            params=params_avail,
            timeout=TIMEOUT
        )
        assert resp_availability.status_code == 200, f"Expected 200 OK on availability check, got {resp_availability.status_code}"
        availability_json = resp_availability.json()
        assert isinstance(availability_json, dict), "Availability response should be a dict"
        assert "availableSlots" in availability_json, "Availability response missing 'availableSlots' key"

    finally:
        if appointment_id:
            try:
                # Cleanup - delete the appointment if API supports it, to not clutter test environment
                resp_delete = requests.delete(
                    f"{BASE_URL}/appointments/{appointment_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # Accept 200 OK or 204 No Content or 404 Not Found (already deleted)
                assert resp_delete.status_code in (200, 204, 404), f"Unexpected status code on delete: {resp_delete.status_code}"
            except Exception:
                # Suppress any exception on cleanup
                pass

test_appointment_scheduling_endpoints()
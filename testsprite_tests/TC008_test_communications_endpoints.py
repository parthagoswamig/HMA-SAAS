import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Replace these with valid credentials for a user with messaging permissions (e.g., DOCTOR)
AUTH_CREDENTIALS = {
    "username": "doctor1",
    "password": "StrongPassword123"
}

def authenticate():
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": AUTH_CREDENTIALS["username"], "password": AUTH_CREDENTIALS["password"]},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        token = resp.json().get("accessToken") or resp.json().get("token")
        if not token:
            raise Exception("Authentication token not found in login response")
        return token
    except requests.RequestException as e:
        raise Exception(f"Authentication failed: {e}")

def test_communications_endpoints():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    message_payload = {
        "recipientId": "receiver-user-id-123",
        "subject": "Test Message",
        "body": "This is a test message from automated test case TC008."
    }

    created_message_id = None

    try:
        # 1. Send a message - POST /communications/messages
        send_resp = requests.post(
            f"{BASE_URL}/communications/messages",
            json=message_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert send_resp.status_code == 201 or send_resp.status_code == 200, \
            f"Expected 200 or 201 on sending message, got {send_resp.status_code}"
        send_resp_json = send_resp.json()
        assert "id" in send_resp_json, "Response of sending message missing 'id'"
        created_message_id = send_resp_json["id"]

        # 2. Retrieve messages - GET /communications/messages
        get_messages_resp = requests.get(
            f"{BASE_URL}/communications/messages",
            headers=headers,
            timeout=TIMEOUT,
        )
        assert get_messages_resp.status_code == 200, \
            f"Expected 200 on retrieving messages, got {get_messages_resp.status_code}"
        messages = get_messages_resp.json()
        assert isinstance(messages, list), "Messages response should be a list"
        # Check that the message we just sent is in the list (by id or subject)
        found = any(
            (msg.get("id") == created_message_id or msg.get("subject") == message_payload["subject"])
            for msg in messages
        )
        assert found, "Sent message not found in retrieved messages"

        # 3. Retrieve notifications - GET /communications/notifications
        get_notifs_resp = requests.get(
            f"{BASE_URL}/communications/notifications",
            headers=headers,
            timeout=TIMEOUT,
        )
        assert get_notifs_resp.status_code == 200, \
            f"Expected 200 on retrieving notifications, got {get_notifs_resp.status_code}"
        notifications = get_notifs_resp.json()
        assert isinstance(notifications, list), "Notifications response should be a list"

        # 4. RBAC permission check: Try sending message with insufficient permissions
        # Let's simulate with a PATIENT role (assumed restricted)
        # Authenticate as patient
        patient_token = None
        try:
            patient_login_resp = requests.post(
                f"{BASE_URL}/auth/login",
                json={"username": "patient1", "password": "PatientPass123"},
                timeout=TIMEOUT,
            )
            patient_login_resp.raise_for_status()
            patient_token = patient_login_resp.json().get("accessToken") or patient_login_resp.json().get("token")
            assert patient_token, "Patient auth token missing"
        except Exception:
            patient_token = None

        if patient_token:
            patient_headers = {
                "Authorization": f"Bearer {patient_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            restricted_send_resp = requests.post(
                f"{BASE_URL}/communications/messages",
                json=message_payload,
                headers=patient_headers,
                timeout=TIMEOUT,
            )
            # Assuming RBAC should block sending message by patient
            assert restricted_send_resp.status_code in (401, 403), \
                "Patient user should not have permission to send messages"

    finally:
        # Cleanup: Delete created message if API supports DELETE /communications/messages/:id
        if created_message_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/communications/messages/{created_message_id}",
                    headers=headers,
                    timeout=TIMEOUT,
                )
                # 200 OK or 204 No Content expected on successful deletion
                assert del_resp.status_code in (200, 204, 202), \
                    f"Failed to delete created message, status code: {del_resp.status_code}"
            except requests.RequestException:
                pass

test_communications_endpoints()
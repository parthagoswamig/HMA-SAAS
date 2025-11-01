import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Use valid pharmacist credentials for RBAC permission validation
PHARMACIST_CREDENTIALS = {
    "username": "pharmacist_user",
    "password": "pharmacist_password"
}

def test_pharmacy_endpoints():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    try:
        # Authenticate as pharmacist - get JWT token
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json=PHARMACIST_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, "Login failed for pharmacist"
        token = login_resp.json().get("accessToken")
        assert token, "No access token returned on login"

        auth_header = {"Authorization": f"Bearer {token}"}
        session.headers.update(auth_header)

        # 1) Test GET /pharmacy/orders - should succeed with pharmacist role and DB connection
        get_orders_resp = session.get(f"{BASE_URL}/pharmacy/orders", timeout=TIMEOUT)
        assert get_orders_resp.status_code == 200, f"Failed to get pharmacy orders, status {get_orders_resp.status_code}"
        orders_list = get_orders_resp.json()
        assert isinstance(orders_list, list), "Response for pharmacy orders is not a list"

        # 2) Test POST /pharmacy/orders - create a prescription order, validate DB writes and RBAC
        new_order_payload = {
            "patientId": "test-patient-001",
            "medications": [
                {"drugId": "drug123", "quantity": 2, "instructions": "Take twice daily"}
            ],
            "prescribedBy": "doctor-user-id",
            "notes": "Test order"
        }

        post_order_resp = session.post(f"{BASE_URL}/pharmacy/orders", json=new_order_payload, timeout=TIMEOUT)
        assert post_order_resp.status_code == 201, f"Failed to create pharmacy order, status {post_order_resp.status_code}"
        created_order = post_order_resp.json()
        order_id = created_order.get("id")
        assert order_id, "Created order response missing id"

        # 3) Test GET /pharmacy-management/inventory - get pharmacy inventory with correct RBAC
        get_inventory_resp = session.get(f"{BASE_URL}/pharmacy-management/inventory", timeout=TIMEOUT)
        assert get_inventory_resp.status_code == 200, f"Failed to get pharmacy inventory, status {get_inventory_resp.status_code}"
        inventory = get_inventory_resp.json()
        assert isinstance(inventory, list), "Pharmacy inventory response is not a list"

        # 4) Additional validation: Attempt access with insufficient role, e.g. PATIENT
        # Login as patient to confirm RBAC enforcement
        patient_credentials = {"username": "patient_user", "password": "patient_password"}
        patient_login = session.post(f"{BASE_URL}/auth/login", json=patient_credentials, timeout=TIMEOUT)
        assert patient_login.status_code == 200, "Patient login failed"
        patient_token = patient_login.json().get("accessToken")
        assert patient_token, "Patient access token missing"

        session.headers.update({"Authorization": f"Bearer {patient_token}"})

        patient_get_orders = session.get(f"{BASE_URL}/pharmacy/orders", timeout=TIMEOUT)
        assert patient_get_orders.status_code in (401, 403), "Patient role should not access pharmacy orders"

        patient_post_order = session.post(f"{BASE_URL}/pharmacy/orders", json=new_order_payload, timeout=TIMEOUT)
        assert patient_post_order.status_code in (401, 403), "Patient role should not create pharmacy orders"

        patient_get_inventory = session.get(f"{BASE_URL}/pharmacy-management/inventory", timeout=TIMEOUT)
        assert patient_get_inventory.status_code in (401, 403), "Patient role should not access pharmacy inventory"

    finally:
        # Cleanup: Delete the created pharmacy order to avoid test data pollution
        if 'order_id' in locals():
            session.headers.update(auth_header)  # Reset to pharmacist token to allow deletion
            del_resp = session.delete(f"{BASE_URL}/pharmacy/orders/{order_id}", timeout=TIMEOUT)
            # It's non-critical if deletion fails, but assert 200 or 204
            assert del_resp.status_code in (200, 204), f"Cleanup failed: unable to delete pharmacy order {order_id}"

test_pharmacy_endpoints()
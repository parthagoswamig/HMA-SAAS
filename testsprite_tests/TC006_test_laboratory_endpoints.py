import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Assumed test user credentials with LAB_TECHNICIAN role for RBAC compliance
AUTH_CREDENTIALS = {
    "email": "labtech_test_user@example.com",
    "password": "labtech_password123"
}

def authenticate():
    """Authenticate and return JWT token for LAB_TECHNICIAN."""
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=AUTH_CREDENTIALS, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("accessToken")
        assert token, "Authentication failed: No accessToken received"
        return token
    except requests.RequestException as e:
        assert False, f"Authentication request failed: {e}"

def test_laboratory_endpoints():
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    order_id = None

    try:
        # 1) Create a new lab test order (POST /laboratory/orders)
        order_payload = {
            "patientId": 1,                 # assuming patient ID 1 exists
            "tests": [
                {"testName": "Complete Blood Count", "priority": "normal"},
                {"testName": "Blood Glucose", "priority": "urgent"}
            ],
            "requestedBy": "labtech_test_user"
        }
        response_create = requests.post(f"{BASE_URL}/laboratory/orders", json=order_payload, headers=headers, timeout=TIMEOUT)
        assert response_create.status_code == 201, f"Expected 201 Created but got {response_create.status_code}"
        order_data = response_create.json()
        order_id = order_data.get("id")
        assert order_id is not None, "Created order response missing 'id'"

        # 2) Update test results (PUT /laboratory/orders/:id/results)
        update_payload = {
            "results": [
                {"testName": "Complete Blood Count", "value": "Normal", "units": "", "referenceRange": "N/A"},
                {"testName": "Blood Glucose", "value": "105", "units": "mg/dL", "referenceRange": "70-110"}
            ],
            "status": "completed",
            "updatedBy": "labtech_test_user"
        }
        response_update = requests.put(f"{BASE_URL}/laboratory/orders/{order_id}/results", json=update_payload, headers=headers, timeout=TIMEOUT)
        assert response_update.status_code == 200, f"Expected 200 OK on update but got {response_update.status_code}"
        update_data = response_update.json()
        assert update_data.get("status") == "completed", "Order status not updated to 'completed'"

        # 3) Retrieve lab test orders (GET /laboratory/orders)
        response_get = requests.get(f"{BASE_URL}/laboratory/orders", headers=headers, timeout=TIMEOUT)
        assert response_get.status_code == 200, f"Expected 200 OK on get orders but got {response_get.status_code}"
        orders_list = response_get.json()
        assert isinstance(orders_list, list), "Orders response should be a list"
        assert any(order.get("id") == order_id for order in orders_list), "Created order not found in orders list"

    finally:
        # Cleanup: Attempt to delete the created order if endpoint supported (not specified in PRD)
        if order_id:
            try:
                # If DELETE endpoint exists, otherwise skip.
                del_resp = requests.delete(f"{BASE_URL}/laboratory/orders/{order_id}", headers=headers, timeout=TIMEOUT)
                if del_resp.status_code not in [200, 204, 404]:
                    print(f"Warning: Unexpected status code on order deletion: {del_resp.status_code}")
            except requests.RequestException:
                pass

test_laboratory_endpoints()

import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

# Assuming a SUPER_ADMIN user for full RBAC permissions in billing tests
AUTH_CREDENTIALS = {
    "email": "superadmin@example.com",
    "password": "SuperAdminPass123!"
}

def get_auth_token():
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": AUTH_CREDENTIALS["email"], "password": AUTH_CREDENTIALS["password"]},
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        token = resp.json().get("accessToken")
        assert token, "Login succeeded but no accessToken in response"
        return token
    except requests.RequestException as e:
        raise Exception(f"Authentication failed: {e}")

def test_billing_and_invoicing_endpoints():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    invoice_id = None
    payment_id = None

    # Create invoice payload example (assumed fields)
    invoice_payload = {
        "patientId": "test-patient-001",
        "items": [
            {"description": "Consultation", "amount": 100.0},
            {"description": "Medication", "amount": 50.0}
        ],
        "dueDate": "2024-12-31"
    }

    try:
        # POST /billing/invoices - Generate invoice
        resp = requests.post(
            f"{BASE_URL}/billing/invoices",
            headers=headers,
            json=invoice_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Invoice creation failed with status {resp.status_code}"
        invoice = resp.json()
        invoice_id = invoice.get("id")
        assert invoice_id, "Invoice ID missing in response"

        # GET /billing/invoices - Retrieve list of invoices and confirm new invoice present
        resp = requests.get(
            f"{BASE_URL}/billing/invoices",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Failed to get invoices with status {resp.status_code}"
        invoices = resp.json()
        assert any(inv.get("id") == invoice_id for inv in invoices), "Created invoice not found in invoice list"

        # POST /billing/payments - Process payment for invoice
        payment_payload = {
            "invoiceId": invoice_id,
            "amount": 150.0,
            "paymentMethod": "CREDIT_CARD",
            "transactionId": "txn_test_001"
        }
        resp = requests.post(
            f"{BASE_URL}/billing/payments",
            headers=headers,
            json=payment_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Payment processing failed with status {resp.status_code}"
        payment = resp.json()
        payment_id = payment.get("id")
        assert payment_id, "Payment ID missing in response"
        # Confirm payment is linked to correct invoice and amount
        assert payment.get("invoiceId") == invoice_id, "Payment invoiceId mismatch"
        assert abs(payment.get("amount", 0) - 150.0) < 0.0001, "Payment amount mismatch"

        # GET /billing/invoices/stats - Get invoice statistics
        resp = requests.get(
            f"{BASE_URL}/billing/invoices/stats",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Failed to get invoice stats with status {resp.status_code}"
        stats = resp.json()
        # Basic validation of stats keys and types
        assert isinstance(stats, dict), "Invoice stats response not a dict"
        for key in ["totalInvoices", "paidInvoices", "unpaidInvoices", "overdueInvoices"]:
            assert key in stats, f"Missing stat key: {key}"
            assert isinstance(stats[key], int), f"Stat {key} is not int"

        # GET /billing/invoices/reports/revenue - Get revenue report
        resp = requests.get(
            f"{BASE_URL}/billing/invoices/reports/revenue",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Failed to get revenue report with status {resp.status_code}"
        report = resp.json()
        assert isinstance(report, dict), "Revenue report response not a dict"
        for key in ["totalRevenue", "revenueByMonth"]:
            assert key in report, f"Missing revenue report key: {key}"
        # revenueByMonth should be a dict mapping month strings to amounts
        assert isinstance(report.get("revenueByMonth"), dict), "revenueByMonth is not a dict"

        # RBAC Permission Checks
        # Attempt an unauthorized action with lower role - e.g., DOCTOR role
        # Login as DOCTOR
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "doctor_user@example.com", "password": "DoctorPass123!"},
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, "Doctor login failed"
        doctor_token = resp.json().get("accessToken")
        assert doctor_token, "Doctor token missing"
        doctor_headers = {"Authorization": f"Bearer {doctor_token}", "Content-Type": "application/json"}

        # Doctor tries to create invoice - should be forbidden or unauthorized
        resp = requests.post(
            f"{BASE_URL}/billing/invoices",
            headers=doctor_headers,
            json=invoice_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code in (401, 403), "Unauthorized user able to create invoice"

    finally:
        # Cleanup: delete created payment if API allows
        if payment_id:
            try:
                resp = requests.delete(
                    f"{BASE_URL}/billing/payments/{payment_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                # Allow 200 or 204 for successful delete
                assert resp.status_code in (200, 204), f"Failed to delete payment with status {resp.status_code}"
            except Exception:
                pass

        # Cleanup: delete created invoice if API allows
        if invoice_id:
            try:
                resp = requests.delete(
                    f"{BASE_URL}/billing/invoices/{invoice_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert resp.status_code in (200, 204), f"Failed to delete invoice with status {resp.status_code}"
            except Exception:
                pass

test_billing_and_invoicing_endpoints()

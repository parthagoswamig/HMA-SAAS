import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_authentication_and_authorization_endpoints():
    headers = {"Content-Type": "application/json"}
    # User data for registration and login
    user_data = {
        "email": "testuser@example.com",
        "password": "TestPass123!",
        "role": "PATIENT",
        "firstName": "Test",
        "lastName": "User",
        "tenantId": str(uuid.uuid4())
    }

    try:
        # 1. Register new user
        register_resp = requests.post(
            f"{BASE_URL}/auth/register",
            json=user_data,
            headers=headers,
            timeout=TIMEOUT
        )
        assert register_resp.status_code == 201, f"Registration failed: {register_resp.text}"
        register_json = register_resp.json()
        assert "id" in register_json, "User ID missing in registration response"

        # 2. Login with registered user credentials
        login_payload = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_resp = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        assert "accessToken" in login_json, "accessToken missing in login response"
        assert "refreshToken" in login_json, "refreshToken missing in login response"
        access_token = login_json["accessToken"]
        refresh_token = login_json["refreshToken"]

        auth_headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # 3. Access profile endpoint with access token - valid RBAC enforcement
        profile_resp = requests.get(
            f"{BASE_URL}/auth/profile",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert profile_resp.status_code == 200, f"Profile retrieval failed: {profile_resp.text}"
        profile_json = profile_resp.json()
        assert profile_json.get("email") == user_data["email"], "Profile email mismatch"
        # Check role enforcement
        assert "role" in profile_json, "Role missing in profile response"
        assert profile_json["role"] == user_data["role"], f"Role mismatch: expected {user_data['role']}"

        # 4. Use refresh token to get new access token
        refresh_payload = {
            "refreshToken": refresh_token
        }
        refresh_resp = requests.post(
            f"{BASE_URL}/auth/refresh",
            json=refresh_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert refresh_resp.status_code == 200, f"Token refresh failed: {refresh_resp.text}"
        refresh_json = refresh_resp.json()
        assert "accessToken" in refresh_json, "New accessToken missing in refresh response"
        new_access_token = refresh_json["accessToken"]
        assert new_access_token != access_token, "New access token should differ from old token"

        # 5. Verify access with refreshed token
        refreshed_auth_headers = {
            "Authorization": f"Bearer {new_access_token}"
        }
        refreshed_profile_resp = requests.get(
            f"{BASE_URL}/auth/profile",
            headers=refreshed_auth_headers,
            timeout=TIMEOUT
        )
        assert refreshed_profile_resp.status_code == 200, f"Profile retrieval with refreshed token failed: {refreshed_profile_resp.text}"
        refreshed_profile_json = refreshed_profile_resp.json()
        assert refreshed_profile_json.get("email") == user_data["email"], "Profile email mismatch with refreshed token"

        # 6. Verify RBAC enforcement for accessing a protected resource as this role (PATIENT)
        # For example, try to access admin-only endpoint /rbac/roles and expect failure (403 or 401)
        rbac_roles_resp = requests.get(
            f"{BASE_URL}/rbac/roles",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert rbac_roles_resp.status_code in (401,403), f"RBAC enforcement failed: PATIENT should not access /rbac/roles but got {rbac_roles_resp.status_code}"

    except AssertionError as ae:
        raise ae
    except requests.exceptions.RequestException as re:
        # Could indicate database connectivity or network issues
        raise AssertionError(f"Request failed: {str(re)}")
    finally:
        # Cleanup: delete created user if possible
        # Assuming an admin token environment or endpoint is available,
        # but since not specified, attempt self-delete if API allows (not in PRD)
        # Otherwise, this step is omitted due to missing delete user endpoint
        pass

test_authentication_and_authorization_endpoints()
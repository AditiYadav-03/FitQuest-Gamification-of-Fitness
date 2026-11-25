def test_register_success(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newathlete@fitquest.com",
        "username": "newathlete",
        "full_name": "New Athlete",
        "password": "Password123!"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "newathlete"
    assert data["user"]["role"] == "user"

def test_register_duplicate_email(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newathlete@fitquest.com",
        "username": "different_user",
        "full_name": "Another Athlete",
        "password": "Password123!"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_login_success(client):
    res = client.post("/api/v1/auth/login", json={
        "username_or_email": "newathlete",
        "password": "Password123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_invalid_credentials(client):
    res = client.post("/api/v1/auth/login", json={
        "username_or_email": "newathlete",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email/username or password" in res.json()["detail"]

def test_get_current_user_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["username"] == "testuser"

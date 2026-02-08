import requests
import json

# First, login to get a token
login_url = "http://localhost:5001/api/v1/auth/login"
login_data = {
    "username": "admin@photocup.com",  # Update with actual admin email
    "password": "admin123"  # Update with actual password
}

print("1. Intentando hacer login...")
try:
    response = requests.post(login_url, data=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"\n2. Token obtenido: {token[:50]}...")
        
        # Now test the /users/ endpoint
        users_url = "http://localhost:5001/api/v1/users/"
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n3. Llamando al endpoint /users/...")
        users_response = requests.get(users_url, headers=headers)
        print(f"Status: {users_response.status_code}")
        print(f"Headers: {dict(users_response.headers)}")
        print(f"Response: {users_response.text}")
    else:
        print("Login falló")
except Exception as e:
    print(f"Error: {e}")

import requests

# Test endpoint de usuarios
try:
    response = requests.get("http://localhost:5001/api/v1/photos/stats")
    print("Stats endpoint:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Total participantes: {data.get('total_participants')}")
        print(f"Total fotos: {data.get('total_photos')}")
except Exception as e:
    print(f"Error stats: {e}")

# Test endpoint de jueces
try:
    response = requests.get("http://localhost:5001/api/v1/photos/judges")
    print("\nJudges endpoint:", response.status_code)
    if response.status_code == 200:
        judges = response.json()
        print(f"Total jueces: {len(judges)}")
        for j in judges:
            print(f"  - {j['name']}: {j['evaluations']} evaluaciones")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error judges: {e}")

print("\nIntenta acceder a http://localhost:5001/docs para ver los endpoints disponibles")

import requests
try:
    resp = requests.get("http://localhost:8000/api/verify-keys")
    print(resp.json())
except Exception as e:
    print(e)

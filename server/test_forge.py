import requests
import json

def test_forge():
    url = "http://localhost:8000/api/forge/generate"
    payload = {
        "type": "description",
        "productName": "EcoBottle",
        "productDescription": "Sustainable water bottle",
        "tone": "Eco-friendly"
    }
    
    print(f"Testing {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print("Response Body:", json.dumps(data, indent=2))
        except:
            print("Response Text:", response.text)
            
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_forge()

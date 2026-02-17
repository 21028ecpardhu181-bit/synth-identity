import requests
import json

def test_chat():
    url = "http://localhost:8000/api/chat"
    payload = {
        "message": "Hello, who are you?",
        "history": []
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
    test_chat()

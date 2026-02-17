import os
import requests
import base64
from dotenv import load_dotenv

# Load env with override
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

api_key = os.getenv("STABLE_DIFFUSION_API_KEY")
print(f"API Key Found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"Key preview: {api_key[:5]}...{api_key[-5:]}")

def test_stability():
    if not api_key:
        print("Missing API Key")
        return

    print("Testing Stability AI Generation...")
    api_host = "https://api.stability.ai"
    engine_id = "stable-diffusion-xl-1024-v1-0"
    
    try:
        response = requests.post(
            f"{api_host}/v1/generation/{engine_id}/text-to-image",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            json={
                "text_prompts": [{"text": "A minimalist blue tech logo"}],
                "cfg_scale": 7,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30,
            },
        )

        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
        else:
            data = response.json()
            base64_image = data["artifacts"][0]["base64"]
            output_path = "test_logo.png"
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(base64_image))
            print(f"Success! Image saved to {output_path}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_stability()

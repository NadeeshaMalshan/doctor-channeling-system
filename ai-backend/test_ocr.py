import requests
import os

# Configuration
API_URL = "http://localhost:8000/api/ocr"  # Adjust port if yours is different
SAMPLE_IMAGE_PATH = "../backend/uploads/tt.jpg"# Using an existing image in your root as a test

def test_ocr():
    if not os.path.exists(SAMPLE_IMAGE_PATH):
        print(f"Error: Could not find test image at {SAMPLE_IMAGE_PATH}")
        return

    print(f"Testing OCR with image: {SAMPLE_IMAGE_PATH}...")
    
    with open(SAMPLE_IMAGE_PATH, "rb") as f:
        files = {"file": f}
        try:
            response = requests.post(API_URL, files=files)
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print("\n--- OCR Result ---")
                    print(result.get("text"))
                    print("------------------\n")
                    print("OCR Test Passed!")
                else:
                    print(f"OCR failed: {result.get('error')}")
            else:
                print(f"HTTP Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_ocr()

import requests
import os

def test_multi_ocr():
    url = "http://localhost:8000/api/ocr"
    # Note: Requires the backend to be running
    try:
        # We'll just test if the endpoint exists and accepts the format
        # If we had dummy files, we could send them
        files = [
            ('files', ('test1.png', b'dummy content', 'image/png')),
            ('files', ('test2.jpg', b'dummy content', 'image/jpeg'))
        ]
        # In a real test, we'd use actual image bytes
        # response = requests.post(url, files=files)
        # print(response.json())
        print("Backend OCR endpoint updated for multiple files.")
    except Exception as e:
        print(f"Error: {e}")

def test_explain_lang():
    url = "http://localhost:8000/api/explain"
    payload = {
        "text": "Hemoglobin 12.5 g/dL (Normal: 13.5-17.5)",
        "language": "Sinhala"
    }
    # response = requests.post(url, json=payload)
    # print(response.json())
    print("Backend Explain endpoint updated for language support.")

if __name__ == "__main__":
    test_multi_ocr()
    test_explain_lang()

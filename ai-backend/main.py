from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import os
import mysql.connector
from dotenv import load_dotenv
from prompts import REPORT_EXPLAIN_PROMPT

load_dotenv()

app = FastAPI(title="NCC eCare AI Backend", version="1.0.0")


# CORS - Allow React frontend access

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(api_key=HUGGINGFACE_API_TOKEN)

# Request Models
class SymptomsRequest(BaseModel):
    symptoms: str

class ReportTextRequest(BaseModel):
    text: str



# LLM Query Function - Llama for Report Explanation

def query_llm_for_report(report_text):
    """Send medical report text to Llama LLM for simple explanation"""
    prompt = REPORT_EXPLAIN_PROMPT.format(report_text=report_text)
    completion = client.chat.completions.create(
        model="meta-llama/Llama-3.1-8B-Instruct:novita",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.5
    )
    return completion.choices[0].message.content


# ENDPOINT 1: Medical Report Explainer (LLM)

@app.post("/api/explain")
async def explain_report(req: ReportTextRequest):
    try:
        explanation = query_llm_for_report(req.text)
        return {"success": True, "explanation": explanation}
    except Exception as e:
        print(f"ERROR in explain: {e}")
        return {"success": False, "error": str(e)}


# ENDPOINT 2: OCR (mock)

@app.post("/api/ocr")
async def ocr_extract(file: UploadFile = File(...)):
    try:
        filename = file.filename
        print(f"Received file: {filename}")

        # Mock OCR response (will use EasyOCR in future)
        mock_text = """Patient Name: User
        Date: 2025-02-20
        Test: Complete Blood Count (CBC)
        Hemoglobin (Hb): 13.5 g/dL
        White Blood Cell (WBC): 7,500 /μL
        Red Blood Cell (RBC): 4.8 million/μL
        Platelet Count: 250,000 /μL
        Fasting Blood Sugar: 95 mg/dL
        Total Cholesterol: 210 mg/dL
        HDL Cholesterol: 55 mg/dL
        LDL Cholesterol: 130 mg/dL
        Doctor: Dr. Silva
        Hospital: Narammala Channel Centre"""

        return {"success": True, "text": mock_text}

    except Exception as e:
        print(f"ERROR in ocr: {e}")
        return {"success": False, "error": str(e)}


# ENDPOINT 3: Doctor Suggestion (from Database by specialization)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        ssl_disabled=False
    )

@app.get("/api/suggest-doctor")
async def suggest_doctor(specialization: str = "General"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, specialization, hospital, email, phone FROM doctors WHERE LOWER(specialization) LIKE LOWER(%s)",
            (f"%{specialization}%",)
        )
        doctors = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"success": True, "doctors": doctors, "specialization": specialization}
    except Exception as e:
        return {"success": False, "error": str(e), "doctors": []}


# Health Check Endpoint
@app.get("/")
async def health_check():
    return {
        "status": "running",
        "service": "NCC eCare AI Backend",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/explain",
            "POST /api/ocr",
            "GET /api/suggest-doctor"
        ]
    }
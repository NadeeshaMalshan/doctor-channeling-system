DISEASE_PREDICT_PROMPT = """You are a medical AI assistant. Based on the symptoms provided by the patient, predict the most likely disease or condition.

Rules:
- Respond ONLY in this exact JSON format: {"disease": "disease name", "explanation": "brief explanation in simple language", "specialization": "medical specialization"}
- Keep explanation under 3 sentences, simple enough for a patient to understand
- Always include the medical specialization needed (e.g., Neurology, Cardiology, Dermatology, etc.)
- Add a disclaimer that this is not a professional diagnosis

Patient symptoms: {symptoms}

Respond in JSON only:"""

SPECIALIZATION_MAP = {
    "neurology": ["headache", "migraine", "seizure", "dizziness", "numbness"],
    "cardiology": ["chest pain", "heart", "blood pressure", "palpitations"],
    "dermatology": ["skin", "rash", "acne", "eczema", "itching"],
    "orthopedics": ["bone", "joint", "back pain", "fracture", "knee"],
    "gastroenterology": ["stomach", "digestion", "nausea", "vomiting", "diarrhea"],
    "pulmonology": ["breathing", "cough", "asthma", "lung", "wheezing"],
    "endocrinology": ["diabetes", "thyroid", "hormone"],
    "ophthalmology": ["eye", "vision", "blurry"],
    "ent": ["ear", "nose", "throat", "sinus"],
    "psychiatry": ["anxiety", "depression", "stress", "insomnia", "mental"],
    "general": ["fever", "cold", "flu", "fatigue"]
}
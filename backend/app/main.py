from fastapi import FastAPI
from app.services.detector import SentinAIDetector

app = FastAPI(title="SentinAI API", version="1.0")

# Initialize AI Engine
detector = SentinAIDetector()

@app.get("/")
def health_check():
    return {"status": "active", "system": "SentinAI v1.0"}

@app.post("/analyze")
def analyze_snapshot():
    # Placeholder for video frame analysis
    return {"message": "Send a frame to analyze"}
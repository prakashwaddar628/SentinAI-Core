import cv2
import numpy as np
import shutil
import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import uvicorn

# Imports
from app.services.detector import SentinAIDetector
from app.services.gesture import GestureRecognizer
from app.models import Alert
from app.db import init_db, get_session, engine

app = FastAPI(title="SentinAI API", version="1.1")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Storage for Evidence Images
EVIDENCE_DIR = "evidence"
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# Global Models
yolo_detector = None
gesture_recognizer = None

@app.on_event("startup")
def startup_event():
    global yolo_detector, gesture_recognizer
    print("🚀 SentinAI System Starting...")
    
    # 1. Initialize DB
    init_db()
    print("💾 Database Initialized (sentinai.db)")
    
    # 2. Load Models
    try:
        yolo_detector = SentinAIDetector(model_path="weights/yolo11n.pt")
        gesture_recognizer = GestureRecognizer()
        print("✅ AI Models Loaded")
    except Exception as e:
        print(f"❌ AI Load Error: {e}")

@app.get("/")
def health_check():
    return {"status": "active", "db": "connected"}

# --- NEW: Get History Endpoint ---
@app.get("/history")
def get_history(session: Session = Depends(get_session)):
    """Fetch last 50 alerts from database"""
    statement = select(Alert).order_by(Alert.timestamp.desc()).limit(50)
    results = session.exec(statement).all()
    return results

@app.post("/analyze")
async def analyze_frame(
    file: UploadFile = File(...), 
    session: Session = Depends(get_session)
):
    if not yolo_detector or not gesture_recognizer:
        raise HTTPException(status_code=503, detail="AI Loading...")

    # 1. Process Image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. AI Inference
    yolo_alerts = yolo_detector.detect_frame(frame)
    sos_alerts, _ = gesture_recognizer.detect_sos(frame)
    combined_alerts = yolo_alerts + sos_alerts

    # 3. SAVE TO DB (The New Part)
    saved_records = []
    
    if combined_alerts:
        # Save the image as evidence
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{timestamp}.jpg"
        filepath = os.path.join(EVIDENCE_DIR, filename)
        cv2.imwrite(filepath, frame)

        for alert in combined_alerts:
            # Normalize data
            alert_type = alert.get("class") or alert.get("type")
            conf = alert.get("confidence")
            
            # Create DB Record
            db_alert = Alert(
                type=alert_type,
                confidence=conf,
                is_critical=True,
                image_path=filepath
            )
            session.add(db_alert)
            saved_records.append(db_alert)
        
        session.commit() # Save changes to file

    return {
        "status": "success",
        "critical": len(combined_alerts) > 0,  # <--- THIS WAS MISSING
        "alerts_found": len(combined_alerts),
        "saved_to_db": len(saved_records) > 0,
        "alerts": combined_alerts
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
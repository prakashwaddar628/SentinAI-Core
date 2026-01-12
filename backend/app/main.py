import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import our AI Modules
from app.services.detector import SentinAIDetector
from app.services.gesture import GestureRecognizer

app = FastAPI(title="SentinAI API", version="1.0")

# Enable CORS (Allows your Next.js frontend to talk to this Python backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold models (loaded on startup)
yolo_detector = None
gesture_recognizer = None

@app.on_event("startup")
def load_models():
    """Load AI models once when the server starts to save memory."""
    global yolo_detector, gesture_recognizer
    print("🚀 SentinAI System Starting...")
    
    # Initialize YOLO (Fire/Accident)
    # Ensure you ran 'python download_weights.py' first!
    try:
        yolo_detector = SentinAIDetector(model_path="weights/yolo11n.pt")
        print("✅ YOLOv11 Loaded Successfully")
    except Exception as e:
        print(f"❌ Error loading YOLO: {e}")

    # Initialize MediaPipe (SOS Gesture)
    try:
        gesture_recognizer = GestureRecognizer()
        print("✅ MediaPipe Gesture Engine Loaded")
    except Exception as e:
        print(f"❌ Error loading MediaPipe: {e}")

@app.get("/")
def health_check():
    return {"status": "active", "system": "SentinAI v1.0", "message": "System Ready"}

@app.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Main Endpoint: Receives an image file, runs AI, returns alerts.
    """
    if not yolo_detector or not gesture_recognizer:
        raise HTTPException(status_code=503, detail="AI Models not initialized")

    try:
        # 1. Read Image Bytes & Convert to OpenCV format
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # 2. Run Infrastructure Detection (Fire, Crash, Weapon)
        yolo_alerts = yolo_detector.detect_frame(frame)

        # 3. Run Social Safety Detection (SOS Hand Gesture)
        sos_alerts, _ = gesture_recognizer.detect_sos(frame)

        # 4. Combine Results
        combined_alerts = yolo_alerts + sos_alerts
        
        # Priority Logic: If Fire or SOS is found, mark frame as 'Critical'
        is_critical = len(combined_alerts) > 0

        return {
            "status": "success",
            "critical": is_critical,
            "timestamp": "real-time",  # You can add actual datetime here
            "alerts": combined_alerts
        }

    except Exception as e:
        print(f"Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the server
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
from ultralytics import YOLO
import cv2

class SentinAIDetector:
    def __init__(self, model_path="weights/yolo11n.pt"):
        # Load model once on startup
        print("Loading YOLOv11 model...")
        self.model = YOLO(model_path)
    
    def detect_frame(self, frame):
        """
        Runs inference on a single video frame.
        """
        results = self.model(frame)
        detections = []
        
        for result in results:
            for box in result.boxes:
                # Extract data: Class ID, Confidence, Coordinates
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Filter: Only keep high confidence
                if conf > 0.6:
                    detections.append({
                        "class": self.model.names[cls_id],
                        "confidence": conf,
                        "bbox": box.xyxy[0].tolist()
                    })
        return detections
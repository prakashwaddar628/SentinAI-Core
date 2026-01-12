import mediapipe as mp
import cv2

class GestureRecognizer:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils

    def detect_sos(self, frame):
        """
        Detects the 'SOS' signal: Open Palm -> Thumb Tucked -> Fist.
        For Hackathon/Demo simplicity, we detect 'Thumb Tucked inside Palm'.
        """
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        
        alerts = []
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Get coordinates of key points
                # 4 = Thumb Tip, 3 = Thumb IP, 2 = Thumb MCP
                # 8, 12, 16, 20 = Finger Tips
                
                thumb_tip = hand_landmarks.landmark[4]
                index_tip = hand_landmarks.landmark[8]
                middle_tip = hand_landmarks.landmark[12]
                
                # Logic: Is Thumb Tip 'below' the Index Finger knuckle? (y-axis)
                # And are fingers curled over it?
                
                # Simple Hackathon Logic:
                # If Thumb is roughly in the center of the palm (x-axis comparison)
                if self._is_thumb_tucked(hand_landmarks):
                    alerts.append({
                        "type": "SOS_GESTURE",
                        "confidence": 0.95,
                        "message": "Distress Signal Detected"
                    })
                    
        return alerts, results.multi_hand_landmarks

    def _is_thumb_tucked(self, lm):
        """
        Check if thumb tip (4) is inside the palm (between index base and pinky base).
        """
        thumb_tip = lm.landmark[4]
        index_base = lm.landmark[5]
        pinky_base = lm.landmark[17]
        
        # Check X-axis (Horizontal): Is thumb between index and pinky?
        if index_base.x < thumb_tip.x < pinky_base.x or pinky_base.x < thumb_tip.x < index_base.x:
            # Check Y-axis (Vertical): Is thumb below the fingers?
            if thumb_tip.y > index_base.y: 
                return True
        return False
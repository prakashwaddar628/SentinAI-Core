from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str             # e.g., "fire", "accident", "SOS_GESTURE"
    confidence: float     # e.g., 0.95
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_critical: bool     # True/False
    image_path: Optional[str] = None # Path to saved evidence image
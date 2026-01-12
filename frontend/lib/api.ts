import axios from 'axios';

// Connect to your Python Backend
const API_URL = 'http://127.0.0.1:8000';

export interface Alert {
  type?: string;     // For SOS (e.g., "SOS_GESTURE")
  class?: string;    // For YOLO (e.g., "fire", "accident")
  confidence: number;
  message?: string;
  bbox?: number[];
}

export interface AnalysisResponse {
  status: string;
  critical: boolean;
  timestamp: string;
  alerts: Alert[];
}

export const analyzeFrame = async (imageBlob: Blob): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', imageBlob, 'frame.jpg');

  try {
    const response = await axios.post(`${API_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
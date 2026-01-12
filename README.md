# 👁️ SentinAI: Urban Resilience & Safety Grid

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-v14-black)
![Status](https://img.shields.io/badge/status-prototype-orange)

**SentinAI** is a real-time, hybrid edge-cloud surveillance system designed to detect infrastructure hazards (Fire/Accidents) and social safety threats (SOS Gestures) simultaneously using a single camera feed.

## 🚀 Key Features

- **Multi-Modal Detection:** Combines **YOLOv11** (Object Detection) and **MediaPipe** (Pose Estimation).
- **Privacy-First:** Processes video on the Edge; only metadata and anonymized alerts are sent to the dashboard.
- **Real-Time Dashboard:** A Next.js command center for monitoring threats with <200ms latency.
- **SOS Gesture Recognition:** Detects the universal "Signal for Help" hand sign.

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **AI Engine** | Python, PyTorch | YOLOv11 for Fire/Weapon detection. |
| **Gesture Logic** | MediaPipe | Skeletal tracking for SOS/Faint detection. |
| **Backend** | FastAPI | Asynchronous API to stream inference results. |
| **Frontend** | Next.js 14, Tailwind | Responsive dark-mode dashboard for authorities. |

## ⚙️ Architecture

```mermaid
graph LR
    A[CCTV Feed] --> B(FastAPI Edge Server)
    B --> C{AI Pipeline}
    C -->|Module A| D[YOLOv11: Fire/Crash]
    C -->|Module B| E[MediaPipe: SOS Gesture]
    C --> F[Alert Logic]
    F --> G[Next.js Dashboard]
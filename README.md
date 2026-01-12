SentinAI-Core/
│
├── backend/                   # FastAPI Server (The Brain)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Entry point
│   │   ├── core/              # Configs (Env variables, settings)
│   │   │   └── config.py
│   │   ├── api/               # API Endpoints (Routes)
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── detect.py  # Routes for video processing
│   │   │       │   └── alerts.py  # Routes for fetching alerts
│   │   │       └── router.py
│   │   ├── services/          # Business Logic (Heavy AI code)
│   │   │   ├── detector.py    # YOLOv11 Logic (Fire/Accident)
│   │   │   └── gesture.py     # MediaPipe Logic (SOS Hand)
│   │   └── schemas/           # Pydantic Models (Data Validation)
│   │       └── alert.py
│   ├── weights/               # Store your .pt model files here
│   │   └── yolo11n.pt
│   ├── requirements.txt
│   └── Dockerfile             # For containerization
│
├── frontend/                  # Next.js Dashboard (The Face)
│   ├── app/                   # Next.js 14+ App Directory
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/            # Reusable UI widgets
│   │   ├── VideoFeed.tsx
│   │   └── AlertCard.tsx
│   ├── lib/                   # API Helpers
│   │   └── api.ts
│   └── package.json
│
├── .gitignore
└── README.md                  # Crucial for GSoC!
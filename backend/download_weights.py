from ultralytics import YOLO

# Load the model (this will auto-download yolo11n.pt if missing)
print("Downloading/Loading YOLOv11 model...")
model = YOLO('yolo11n.pt')

# Optional: Export if you really need torchscript, but usually .pt is fine for Python
# model.export(format='torchscript')

print("Success! Model saved.")
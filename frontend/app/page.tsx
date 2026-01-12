"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeFrame, Alert } from "@/lib/api";
import { Siren, ShieldAlert, Activity, Camera } from "lucide-react";

export default function Dashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // 1. Start Webcam on Load
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startVideo();
  }, []);

  // 2. The "Heartbeat" Loop (Send frame every 1s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) return;

      setIsProcessing(true);

      // Capture frame to canvas
      const ctx = canvasRef.current.getContext("2d");
      if (ctx && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        // Convert to Blob and Send to API
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              const data = await analyzeFrame(blob);
              if (data.critical) {
                // Prepend new alerts to the list
                setAlerts((prev) => [...data.alerts, ...prev].slice(0, 10)); // Keep last 10
                setLastUpdate(new Date().toLocaleTimeString());
              }
            } catch (e) {
              console.error("Analysis failed", e);
            }
          }
          setIsProcessing(false);
        }, "image/jpeg");
      }
    }, 1000); // 1000ms = 1 second interval

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <main className="min-h-screen p-8 bg-neutral-950 text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-wider">
            SENTIN<span className="text-blue-500">AI</span> CORE
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Activity size={16} className="text-green-500 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Live Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video shadow-2xl">
            {/* The Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* The Live Video */}
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover opacity-90"
            />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 bg-red-600/20 backdrop-blur-md border border-red-500/50 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              LIVE FEED • CAM-01
            </div>
          </div>
        </div>

        {/* Right: Alert Log */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-[600px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Siren className="text-red-500" />
            Incident Log
          </h2>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-center text-neutral-600 mt-20">
                <Camera size={48} className="mx-auto mb-4 opacity-20" />
                <p>No threats detected.</p>
                <p className="text-sm">Monitoring active...</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800/50 border-l-4 border-red-500 p-4 rounded-r-lg animate-in fade-in slide-in-from-right-5 duration-300"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-red-400 uppercase tracking-wider text-sm">
                      {alert.type || alert.class || "ANOMALY"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {lastUpdate}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">
                    {alert.message ||
                      `Object detected with ${Math.round(
                        alert.confidence * 100
                      )}% confidence`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

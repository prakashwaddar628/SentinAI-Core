"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeFrame, getHistory, Alert, HistoryRecord } from "@/lib/api";
import {
  Siren,
  ShieldAlert,
  Activity,
  Camera,
  History,
  LayoutDashboard,
} from "lucide-react";

export default function Dashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Setup Webcam (Only runs once)
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Webcam Error:", err);
      }
    };
    startVideo();
  }, []);

  // 2. Fetch History when tab changes
  useEffect(() => {
    if (activeTab === "history") {
      getHistory().then((data) => setHistoryLogs(data));
    }
  }, [activeTab]);

  // 3. The "Heartbeat" Loop (Live Processing)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeTab !== "live" || !videoRef.current || isProcessing) return;

      setIsProcessing(true);
      const ctx = canvasRef.current?.getContext("2d");

      if (ctx && videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              const data = await analyzeFrame(blob);
              if (data.critical) {
                setLiveAlerts((prev) => [...data.alerts, ...prev].slice(0, 10));
              }
            } catch (e) {
              console.error(e);
            }
          }
          setIsProcessing(false);
        }, "image/jpeg");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, isProcessing]);

  return (
    <main className="min-h-screen p-8 bg-neutral-950 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-wider">
            SENTIN<span className="text-blue-500">AI</span> CORE
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "live"
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} /> Live Monitor
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <History size={16} /> Database Logs
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL: CONTENT CHANGES BASED ON TAB */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "live" ? (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video shadow-2xl group">
              <canvas ref={canvasRef} className="hidden" />
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-4 left-4 bg-red-600/20 backdrop-blur-md border border-red-500/50 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                LIVE FEED • CAM-01
              </div>
            </div>
          ) : (
            // HISTORY TABLE VIEW
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-neutral-800 bg-neutral-800/50">
                <h3 className="font-semibold text-neutral-300">
                  Recorded Incidents (Persisted in SQLite)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                  <thead className="bg-neutral-950 uppercase text-xs font-bold text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Threat Type</th>
                      <th className="px-6 py-3">Confidence</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {historyLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs">
                          #{log.id}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              log.type.includes("SOS")
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(log.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-green-500 text-xs">
                          LOGGED
                        </td>
                      </tr>
                    ))}
                    {historyLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-neutral-600"
                        >
                          No records found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SIDEBAR ALERTS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-[600px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Siren className="text-red-500" />
            {activeTab === "live" ? "Real-time Alerts" : "Filter Logs"}
          </h2>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {/* Show Live Alerts OR a filter message */}
            {activeTab === "live" ? (
              liveAlerts.length === 0 ? (
                <div className="text-center text-neutral-600 mt-20">
                  <Camera size={48} className="mx-auto mb-4 opacity-20" />
                  <p>System Normal</p>
                </div>
              ) : (
                liveAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-800/30 border-l-2 border-red-500 p-3 rounded text-sm animate-in fade-in slide-in-from-right-2"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold text-red-400">
                        {alert.type || alert.class}
                      </span>
                      <span className="text-neutral-500 text-xs">Just now</span>
                    </div>
                    <div className="text-neutral-400 text-xs mt-1">
                      Confidence: {(alert.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="text-neutral-500 text-sm">
                <p>
                  Displaying last 50 records from <code>sentinai.db</code>.
                </p>
                <div className="mt-4 p-4 bg-neutral-950 rounded border border-neutral-800">
                  <div className="text-xs uppercase text-neutral-600 font-bold mb-2">
                    Database Stats
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Total Incidents:</span>
                    <span>{historyLogs.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

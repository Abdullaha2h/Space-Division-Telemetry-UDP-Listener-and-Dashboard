"use client";

import { useState, useEffect } from "react";
import { Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import TelemetryStatsRow from "./TelemetryStatsRow";
import AlertsPanel from "./AlertsPanel";
import ProcessTerminals from "./ProcessTerminals";
import HistoryModal from "./HistoryModal";


// LightPillar uses WebGL — lazy load client-only
const LightPillar = dynamic(() => import("./LightPillar"), { ssr: false });

const SATELLITE_ID = 101;

export default function Dashboard() {
    const [latest, setLatest] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [listenerStatus, setListenerStatus] = useState<"running" | "stopped" | "loading">("loading");
    const [showHistory, setShowHistory] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {


                const [latestRes, alertsRes, statsRes, listenerRes] = await Promise.all([
                    fetch(`/api/telemetry/latest?satellite_id=${SATELLITE_ID}`),
                    fetch(`/api/alerts?satellite_id=${SATELLITE_ID}`),
                    fetch(`/api/stats/satellite/${SATELLITE_ID}`),
                    fetch(`/api/process/listener`),
                ]);
                if (latestRes.ok) setLatest(await latestRes.json());
                if (alertsRes.ok) setAlerts(await alertsRes.json());
                if (statsRes.ok) setStats(await statsRes.json());
                if (listenerRes.ok) {
                    const d = await listenerRes.json();
                    setListenerStatus(d.isRunning ? "running" : "stopped");
                }
            } catch (err) {
                console.error("Poll error:", err);
            }
        };
        fetchAll();
        const interval = setInterval(fetchAll, 3000);
        return () => clearInterval(interval);
    }, []);

    const toggleListener = async () => {
        setListenerStatus("loading");
        const action = listenerStatus === "running" ? "stop" : "start";
        try {
            const res = await fetch("/api/process/listener", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const d = await res.json();
            setListenerStatus(d.success
                ? (action === "start" ? "running" : "stopped")
                : (action === "start" ? "stopped" : "running")
            );
        } catch {
            setListenerStatus("stopped");
        }
    };

    return (
        /* Root: fills viewport, background image, no scroll */
        <div className="h-screen w-full flex flex-col overflow-hidden text-white relative"
            style={{ backgroundImage: "url('/Background.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>

            {/* Dark overlay so UI stays readable over bright parts of the image */}
            <div className="absolute inset-0 z-0 bg-black/55 pointer-events-none" />

            {/* ── All content sits above the overlay ── */}
            <div className="relative z-10 flex flex-col h-full">

                {/* HEADER — glassy bar */}
                <header className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-black/30 backdrop-blur-md shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Telemetry Command Center</h1>
                        <p className="text-[10px] text-white/50">SAT-{SATELLITE_ID} · Ground Control Interface</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentTime && (
                            <div className="h-7 px-3 flex items-center justify-center bg-white/5 border border-white/10 rounded-md text-xs font-mono text-white/80 shrink-0">
                                {currentTime.toLocaleTimeString('en-US', { hour12: true })} <span className="text-[9px] text-white/40 ml-1.5 uppercase tracking-widest text-center mt-0.5">LOCAL</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px]">
                            <span className={`h-1.5 w-1.5 rounded-full ${listenerStatus === "running" ? "bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" : "bg-red-500"}`} />
                            <span className="text-white/50 hidden sm:inline">{listenerStatus === "running" ? "Uplink Active" : "Uplink Offline"}</span>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                {!latest ? (
                    /* No data yet — centered loading with process controls */
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                        <p className="text-sm text-white/40">No telemetry data — start the listener then run the simulator.</p>
                        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4">
                            <ProcessTerminals listenerStatus={listenerStatus} onListenerToggle={toggleListener} onShowHistory={() => setShowHistory(true)} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-2 px-6 py-3 min-h-0">

                        {/* Row 1: Telemetry+Stats (left) | Alerts (right ~25%) */}
                        <div className="flex gap-3 shrink-0">
                            <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl p-3">
                                <TelemetryStatsRow latest={latest} stats={stats} />
                            </div>
                            <div className="w-1/4 shrink-0 rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl p-3" style={{ height: "240px" }}>
                                <AlertsPanel alerts={alerts} />
                            </div>
                        </div>


                        {/* Row 3: Process terminals — fills rest */}
                        <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl p-3">
                            <ProcessTerminals listenerStatus={listenerStatus} onListenerToggle={toggleListener} onShowHistory={() => setShowHistory(true)} />
                        </div>

                    </div>
                )}
            </div>

            {/* Modal overlay */}
            {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
        </div>
    );
}

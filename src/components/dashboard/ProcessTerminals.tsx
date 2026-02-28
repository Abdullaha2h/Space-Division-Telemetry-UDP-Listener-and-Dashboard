"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, RefreshCw, TerminalSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    listenerStatus: "running" | "stopped" | "loading";
    onListenerToggle: () => void;
    onShowHistory?: () => void;
}

export default function ProcessTerminals({ listenerStatus, onListenerToggle, onShowHistory }: Props) {
    const [simLogs, setSimLogs] = useState("Awaiting Tx command...\nPress 'Run Simulator' to send 10 packets.");
    const [listenerLogs, setListenerLogs] = useState("Awaiting listener...\nPress 'Start Listener' to begin.");
    const [simRunning, setSimRunning] = useState(false);
    const simRef = useRef<HTMLPreElement>(null);
    const rxRef = useRef<HTMLPreElement>(null);

    useEffect(() => { if (simRef.current) simRef.current.scrollTop = simRef.current.scrollHeight; }, [simLogs]);
    useEffect(() => { if (rxRef.current) rxRef.current.scrollTop = rxRef.current.scrollHeight; }, [listenerLogs]);

    // Poll listener logs every 2s while running
    useEffect(() => {
        if (listenerStatus !== "running") return;
        const poll = setInterval(async () => {
            try {
                const res = await fetch("/api/process/listener/logs");
                if (res.ok) { const d = await res.json(); if (d.logs) setListenerLogs(d.logs); }
            } catch { /* silent */ }
        }, 2000);
        return () => clearInterval(poll);
    }, [listenerStatus]);

    // Poll simulator logs every second while it's running
    useEffect(() => {
        if (!simRunning) return;
        const poll = setInterval(async () => {
            try {
                const res = await fetch("/api/process/simulator");
                if (res.ok) { const d = await res.json(); if (d.logs) setSimLogs(d.logs); }
            } catch { /* silent */ }
        }, 1000);
        return () => clearInterval(poll);
    }, [simRunning]);

    const runSimulator = async () => {
        setSimRunning(true);
        setSimLogs("Launching simulator → 127.0.0.1:3333\n");
        try {
            const res = await fetch("/api/process/simulator", { method: "POST" });
            const d = await res.json();
            setSimLogs(d.logs || (d.success ? "Simulation complete." : `Error: ${d.error}`));
        } catch { setSimLogs((p) => p + "\n[Network error]"); }
        finally { setSimRunning(false); }
    };

    return (
        <div className="flex flex-col gap-2 h-full">
            {/* Button row */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mr-1">Process Control</span>

                <Button variant="ghost" size="sm"
                    className={`h-7 text-xs border ${listenerStatus === "running" ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"} bg-white/5`}
                    onClick={onListenerToggle} disabled={listenerStatus === "loading"}>
                    {listenerStatus === "running"
                        ? <><Square className="w-3 h-3 mr-1" />Stop Listener</>
                        : <><Play className="w-3 h-3 mr-1" />Start Listener</>}
                </Button>

                <Button variant="ghost" size="sm"
                    className="h-7 text-xs border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 bg-white/5 disabled:opacity-40"
                    onClick={runSimulator} disabled={simRunning || listenerStatus !== "running"}
                    title={listenerStatus !== "running" ? "Start listener first" : "Send 10 test packets"}>
                    {simRunning
                        ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Transmitting...</>
                        : <><TerminalSquare className="w-3 h-3 mr-1" />Run Simulator</>}
                </Button>

                {listenerStatus === "stopped" && (
                    <span className="text-[10px] text-white/25">(Start listener first)</span>
                )}

                {onShowHistory && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-7 text-xs gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                        onClick={onShowHistory}
                    >
                        <Clock className="w-3 h-3" />
                        Historical Data
                    </Button>
                )}
            </div>

            {/* Side-by-side terminals */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">

                {/* Simulator */}
                <div className="flex flex-col rounded-lg border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-white/5 shrink-0">
                        <TerminalSquare className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Simulator (Tx)</span>
                        {simRunning && <span className="ml-auto text-[9px] text-blue-400 animate-pulse">● live</span>}
                    </div>
                    <div className="flex-1 min-h-0 bg-black/40">
                        <pre ref={simRef} className="p-3 h-full overflow-y-auto text-[10px] font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                            {simLogs}
                        </pre>
                    </div>
                </div>

                {/* Listener */}
                <div className="flex flex-col rounded-lg border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-white/5 shrink-0">
                        <TerminalSquare className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Listener (Rx)</span>
                        {listenerStatus === "running" && <span className="ml-auto text-[9px] text-emerald-400 animate-pulse">● live</span>}
                    </div>
                    <div className="flex-1 min-h-0 bg-black/40">
                        <pre ref={rxRef} className="p-3 h-full overflow-y-auto text-[10px] font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                            {listenerLogs}
                        </pre>
                    </div>
                </div>

            </div>
        </div>
    );
}

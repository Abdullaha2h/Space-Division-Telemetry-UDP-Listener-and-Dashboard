"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SATELLITE_ID = 101;
const MAX_RECORDS = 20;

interface TelemetryRecord {
    _id: string;
    timestamp: string;
    battery_voltage: number;
    msi_temperature: number;
    satellite_id: number;
}

export default function HistoryPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [records, setRecords] = useState<TelemetryRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch records from the API, newest first
    const fetchPage = async () => {
        setLoading(true);
        try {
            const to = new Date().toISOString();
            const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const res = await fetch(
                `/api/telemetry/history?satellite_id=${SATELLITE_ID}&from=${from}&to=${to}&sort=desc`
            );
            if (res.ok) {
                const all: TelemetryRecord[] = await res.json();
                setRecords(all.slice(0, MAX_RECORDS));
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        } finally {
            setLoading(false);
        }
    };

    const openPanel = () => {
        setIsOpen(true);
        fetchPage();
    };


    // If the panel is closed, show just the button
    if (!isOpen) {
        return (
            <section>
                <Button variant="outline" className="flex items-center gap-2" onClick={openPanel}>
                    <Clock className="w-4 h-4" />
                    View Historical Telemetry
                </Button>
            </section>
        );
    }

    // Full panel view
    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Historical Telemetry (Last 7 Days)
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4 mr-1" /> Close
                </Button>
            </div>

            <Card className="bg-card border border-border">
                <CardContent className="p-0">
                    {loading ? (
                        <p className="text-center text-sm text-muted-foreground py-8">Loading...</p>
                    ) : (
                        <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-card">
                                    <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                                        <th className="text-left p-3">Timestamp</th>
                                        <th className="text-left p-3">Battery (mV)</th>
                                        <th className="text-left p-3">Temp (°C)</th>
                                        <th className="text-left p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No records found</td></tr>
                                    ) : (
                                        records.map((r) => {
                                            const isAlert = r.battery_voltage < 12000 || r.msi_temperature > 40;
                                            return (
                                                <tr key={r._id} className="border-b border-border/50 hover:bg-muted/20">
                                                    <td className="p-3 text-xs">{new Date(r.timestamp).toLocaleString()}</td>
                                                    <td className={`p-3 font-medium ${r.battery_voltage < 12000 ? "text-yellow-400" : "text-foreground"}`}>
                                                        {r.battery_voltage}
                                                    </td>
                                                    <td className={`p-3 font-medium ${r.msi_temperature > 40 ? "text-red-400" : "text-foreground"}`}>
                                                        {r.msi_temperature}
                                                    </td>
                                                    <td className="p-3">
                                                        {isAlert
                                                            ? <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Alert</span>
                                                            : <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 border-t border-border text-sm text-muted-foreground">
                    <span>Showing {records.length} of latest records (newest first)</span>
                </div>
            </Card>
        </section>
    );
}

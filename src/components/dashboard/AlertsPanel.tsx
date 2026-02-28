"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Alert {
    _id: string;
    alert_level: "Red" | "Yellow";
    message: string;
    timestamp: string;
}

interface Props {
    alerts: Alert[];
}

export default function AlertsPanel({ alerts }: Props) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">Active Alerts</span>
                <Badge className="ml-auto text-[10px] h-5 bg-white/10 text-white border-white/10">{alerts.length}</Badge>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-white/10">
                <ScrollArea className="h-full">
                    <div className="p-1.5 space-y-1.5">
                        {alerts.length === 0 ? (
                            <p className="text-[11px] text-white/80 text-center py-6">No active alerts</p>
                        ) : alerts.map((alert) => (
                            <div
                                key={alert._id}
                                className={`flex items-start gap-2 p-2 rounded-md border text-[11px]
                                    ${alert.alert_level === "Red"
                                        ? "border-red-500/30 bg-red-500/10"
                                        : "border-yellow-500/30 bg-yellow-500/10"
                                    }`}
                            >
                                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${alert.alert_level === "Red" ? "bg-red-400" : "bg-yellow-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-semibold ${alert.alert_level === "Red" ? "text-red-400" : "text-yellow-400"}`}>{alert.alert_level}</span>
                                        <span className="text-white/80 text-[10px]">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-white/80 truncate">{alert.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

"use client";

import { Battery, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
    latest: {
        battery_voltage: number;
        msi_temperature: number;
        timestamp: string;
        satellite_id: number;
    };
}

export default function TelemetryCards({ latest }: Props) {
    const isVoltageLow = latest.battery_voltage < 12000;
    const isTempCritical = latest.msi_temperature > 40;
    const lastSeen = new Date(latest.timestamp).toLocaleString();

    return (
        <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Latest Telemetry — SAT-{latest.satellite_id}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Battery Voltage */}
                <Card className={`bg-card border ${isVoltageLow ? "border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.12)]" : "border-border"}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Battery Voltage</CardTitle>
                        <Battery className={`h-4 w-4 ${isVoltageLow ? "text-yellow-500" : "text-emerald-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {latest.battery_voltage}
                            <span className="text-sm font-normal text-muted-foreground ml-1">mV</span>
                        </div>
                        {isVoltageLow
                            ? <Badge className="mt-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">⚠ Low Voltage</Badge>
                            : <span className="text-xs text-emerald-400 mt-2 block">Nominal</span>
                        }
                    </CardContent>
                </Card>

                {/* MSI Temperature */}
                <Card className={`bg-card border ${isTempCritical ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.12)]" : "border-border"}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-muted-foreground">MSI Temperature</CardTitle>
                        <Thermometer className={`h-4 w-4 ${isTempCritical ? "text-red-500" : "text-cyan-400"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {latest.msi_temperature}
                            <span className="text-sm font-normal text-muted-foreground ml-1">°C</span>
                        </div>
                        {isTempCritical
                            ? <Badge className="mt-2 bg-red-500/10 text-red-400 border border-red-500/30">🔴 Critical Temp</Badge>
                            : <span className="text-xs text-emerald-400 mt-2 block">Nominal</span>
                        }
                    </CardContent>
                </Card>

            </div>
            <p className="text-right text-xs text-muted-foreground mt-2">Last update: {lastSeen}</p>
        </section>
    );
}

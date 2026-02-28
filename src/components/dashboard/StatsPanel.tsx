"use client";

import { Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
    average_battery_voltage: number;
    max_msi_temperature: number;
    min_msi_temperature: number;
    total_packets: number;
}

interface Props {
    stats: Stats;
}

// One small stat box
function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
    );
}

export default function StatsPanel({ stats }: Props) {
    return (
        <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" /> Aggregated Statistics
            </h2>
            <Card className="bg-card border border-border">
                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <StatBox label="Avg Battery Voltage" value={`${Math.round(stats.average_battery_voltage)} mV`} />
                    <StatBox label="Min MSI Temperature" value={`${stats.min_msi_temperature} °C`} />
                    <StatBox label="Max MSI Temperature" value={`${stats.max_msi_temperature} °C`} />
                    <StatBox label="Total Packets" value={String(stats.total_packets)} />
                </CardContent>
            </Card>
        </section>
    );
}

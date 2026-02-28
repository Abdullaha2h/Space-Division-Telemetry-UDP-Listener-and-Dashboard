"use client";

import { Battery, BarChart2 } from "lucide-react";

interface Telemetry { battery_voltage: number; msi_temperature: number; timestamp: string; satellite_id: number; }
interface Stats { average_battery_voltage: number; max_msi_temperature: number; min_msi_temperature: number; total_packets: number; }
interface Props { latest: Telemetry; stats: Stats | null; }

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-2">
            <Icon className="w-3 h-3 text-white/80" />
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">{label}</span>
        </div>
    );
}

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
            <span className="text-[9px] font-medium text-white/80 uppercase tracking-wider">{label}</span>
            <span className={`text-sm font-bold leading-snug ${color ?? "text-white"}`}>{value}</span>
        </div>
    );
}

export default function TelemetryStatsRow({ latest, stats }: Props) {
    const voltLow = latest.battery_voltage < 12000;
    const tempHigh = latest.msi_temperature > 40;

    return (
        <div className="flex flex-col gap-3">

            {/* Live Telemetry */}
            <div>
                <SectionLabel icon={Battery} label="Live Telemetry" />
                <div className="grid grid-cols-2 gap-2">
                    <Chip label="Battery Voltage" value={`${latest.battery_voltage} mV`} color={voltLow ? "text-yellow-400" : "text-emerald-400"} />
                    <Chip label="MSI Temperature" value={`${latest.msi_temperature} °C`} color={tempHigh ? "text-red-400" : "text-cyan-400"} />
                </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Statistics */}
            <div>
                <SectionLabel icon={BarChart2} label="Statistics" />
                <div className="grid grid-cols-4 gap-2">
                    {stats ? (
                        <>
                            <Chip label="Avg Voltage" value={`${Math.round(stats.average_battery_voltage)} mV`} />
                            <Chip label="Max Temp" value={`${stats.max_msi_temperature} °C`} color="text-orange-400" />
                            <Chip label="Min Temp" value={`${stats.min_msi_temperature} °C`} color="text-blue-400" />
                            <Chip label="Packets" value={String(stats.total_packets)} color="text-purple-400" />
                        </>
                    ) : (
                        <p className="col-span-4 text-xs text-white/80">Loading...</p>
                    )}
                </div>
            </div>

            {/* Status badges */}
            <div className="flex gap-2 flex-wrap">
                {voltLow && <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400">⚠ Low Battery Voltage</span>}
                {tempHigh && <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 animate-pulse">🔴 Critical Temperature</span>}
                {!voltLow && !tempHigh && <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">✓ All systems nominal</span>}
            </div>
        </div>
    );
}

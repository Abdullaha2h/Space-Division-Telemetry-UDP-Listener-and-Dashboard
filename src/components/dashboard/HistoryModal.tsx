"use client";

import { useState, useEffect } from "react";
import { X, Clock, Loader2, RefreshCw, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SATELLITE_ID = 101;
const PAGE_SIZE = 20;

interface TelemetryRecord {
    _id: string;
    timestamp: string;
    battery_voltage: number;
    msi_temperature: number;
}

interface Props {
    onClose: () => void;
}

export default function HistoryModal({ onClose }: Props) {
    const [allRecords, setAllRecords] = useState<TelemetryRecord[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Whether the user has manually applied a custom date filter.
    // While false, every refresh auto-advances the To date to now.
    const [userHasFiltered, setUserHasFiltered] = useState(false);

    // Applied (live) filter values — what was last fetched
    const [appliedFrom, setAppliedFrom] = useState("");
    const [appliedTo, setAppliedTo] = useState("");
    const [appliedSort, setAppliedSort] = useState<"asc" | "desc">("desc");

    // Staged filter values — what's in the inputs (not yet applied)
    const [stagedFrom, setStagedFrom] = useState("");
    const [stagedTo, setStagedTo] = useState("");
    const [stagedSort, setStagedSort] = useState<"asc" | "desc">("desc");

    const fetchData = async (from: string, to: string, sort: string) => {
        setLoading(true);
        try {
            let url = `/api/telemetry/history?satellite_id=${SATELLITE_ID}&sort=${sort}`;
            if (from) url += `&from=${new Date(from).toISOString()}`;
            if (to) url += `&to=${new Date(to).toISOString()}`;
            const res = await fetch(url);
            if (res.ok) {
                const data: TelemetryRecord[] = await res.json();
                setAllRecords(data);
                setLastRefreshed(new Date());
                setPage(1);
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 5 s while no custom filter is active — re-fetches all records newest first
    useEffect(() => {
        if (userHasFiltered) return;
        const id = setInterval(() => {
            fetchData(appliedFrom, appliedTo, appliedSort);
        }, 5000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userHasFiltered, appliedFrom, appliedTo, appliedSort]);

    // Load newest-first on first open
    useEffect(() => {
        fetchData(appliedFrom, appliedTo, appliedSort);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply staged filters — locks auto-refresh until Reset
    const handleApply = () => {
        setUserHasFiltered(true);
        setAppliedFrom(stagedFrom);
        setAppliedTo(stagedTo);
        setAppliedSort(stagedSort);
        fetchData(stagedFrom, stagedTo, stagedSort);
    };

    // Reset — clears custom filter and re-enables auto-refresh with no date constraint
    const handleReset = () => {
        setStagedFrom("");
        setStagedTo("");
        setStagedSort("desc");
        setAppliedFrom("");
        setAppliedTo("");
        setAppliedSort("desc");
        setUserHasFiltered(false);
        fetchData("", "", "desc");
    };

    // Inline sort toggle: immediately re-fetches with the toggled sort
    const handleSortToggle = () => {
        const newSort = appliedSort === "desc" ? "asc" : "desc";
        setStagedSort(newSort);
        setAppliedSort(newSort);
        fetchData(appliedFrom, appliedTo, newSort);
    };

    // Manual refresh with currently applied filters
    const handleRefresh = () => fetchData(appliedFrom, appliedTo, appliedSort);

    // Pagination derived values
    const totalPages = Math.max(1, Math.ceil(allRecords.length / PAGE_SIZE));
    const pageRecords = allRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const dateInputStyle: React.CSSProperties = { colorScheme: "dark" };
    const dateInputClass = "h-7 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white/80 focus:outline-none focus:border-emerald-500/40 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Clock className="w-4 h-4 text-white" />
                        Historical Telemetry
                        {!loading && (
                            <span className="text-[10px] font-normal text-white/80 ml-1">
                                {allRecords.length} records
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {lastRefreshed && (
                            <span className="text-[10px] text-white/80 mr-2">
                                {lastRefreshed.toLocaleTimeString()}
                            </span>
                        )}
                        {/* Inline sort toggle — always visible, immediately applies */}
                        <Button variant="ghost" size="sm"
                            onClick={handleSortToggle}
                            disabled={loading}
                            className="h-7 px-2 text-[10px] gap-1 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            title="Toggle sort order">
                            <ArrowUpDown className="w-3 h-3" />
                            {appliedSort === "desc" ? "Newest First" : "Oldest First"}
                        </Button>
                        {/* Filter toggle */}
                        <Button variant="ghost" size="sm"
                            className={`h-7 w-7 p-0 hover:bg-white/20 transition-colors ${showFilters ? "text-emerald-400" : "text-white/80 hover:text-white"}`}
                            onClick={() => setShowFilters((v) => !v)} title="Toggle date filters">
                            <Filter className="w-3.5 h-3.5" />
                        </Button>
                        {/* Manual refresh */}
                        <Button variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            onClick={handleRefresh} disabled={loading} title="Refresh">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        {/* Close */}
                        <Button variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-500/20 text-white/80 hover:text-red-400 transition-colors"
                            onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* ── Optional date filter bar ── */}
                {showFilters && (
                    <div className="flex flex-wrap items-end gap-3 px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/80 uppercase tracking-wider">From</label>
                            <input type="datetime-local" value={stagedFrom}
                                onChange={(e) => setStagedFrom(e.target.value)}
                                style={dateInputStyle} className={dateInputClass} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/80 uppercase tracking-wider">To</label>
                            <input type="datetime-local" value={stagedTo}
                                onChange={(e) => setStagedTo(e.target.value)}
                                style={dateInputStyle} className={dateInputClass} />
                        </div>
                        <Button size="sm" onClick={handleApply} disabled={loading}
                            className="h-7 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20">
                            Apply
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleReset}
                            className="h-7 text-xs text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                            Reset
                        </Button>
                    </div>
                )}

                {/* ── Table — fixed height, scrollable within the page ── */}
                <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
                    {loading && allRecords.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
                                <tr className="border-b border-white/10 text-[10px] text-white/80 uppercase">
                                    <th className="text-left px-5 py-2">Timestamp</th>
                                    <th className="text-left px-4 py-2">Battery (mV)</th>
                                    <th className="text-left px-4 py-2">Temp (°C)</th>
                                    <th className="text-left px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-white/80 text-xs">
                                            No records found
                                        </td>
                                    </tr>
                                ) : pageRecords.map((r) => {
                                    const hasAlert = r.battery_voltage < 12000 || r.msi_temperature > 40;
                                    return (
                                        <tr key={r._id} className="border-b border-white/[0.06] hover:bg-white/10 transition-colors">
                                            <td className="px-5 py-2 text-xs text-white/80 group-hover:text-white">{new Date(r.timestamp).toLocaleString()}</td>
                                            <td className={`px-4 py-2 text-xs font-medium ${r.battery_voltage < 12000 ? "text-yellow-400" : "text-white"}`}>
                                                {r.battery_voltage}
                                            </td>
                                            <td className={`px-4 py-2 text-xs font-medium ${r.msi_temperature > 40 ? "text-red-400" : "text-white"}`}>
                                                {r.msi_temperature}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${hasAlert
                                                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"}`}>
                                                    {hasAlert ? "Alert" : "OK"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Footer with pagination ── */}
                <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/10 text-xs text-white/80">
                    <span>{allRecords.length} total · page {page} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                        {loading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        <Button variant="ghost" size="sm"
                            className="h-6 w-6 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm"
                            className="h-6 w-6 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => p + 1)}>
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

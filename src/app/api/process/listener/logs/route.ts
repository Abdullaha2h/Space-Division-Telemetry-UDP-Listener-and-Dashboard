import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logFile = path.join(process.cwd(), '.listener_logs');
        if (!fs.existsSync(logFile)) {
            return NextResponse.json({ logs: "" });
        }

        // Read tail of the file (simplified load for dashboard)
        const stats = fs.statSync(logFile);
        const chunkSize = 5000; // Read last 5KB
        const start = Math.max(0, stats.size - chunkSize);

        const buffer = Buffer.alloc(chunkSize);
        const fd = fs.openSync(logFile, 'r');
        const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, start);
        fs.closeSync(fd);

        const logs = buffer.toString('utf-8', 0, bytesRead);

        return NextResponse.json({ logs });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to read logs", details: e.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), '.listener_logs');
const PID_FILE = path.join(process.cwd(), '.listener_pid');

// Module-level reference — survives normal requests but reset on hot-reload
let listenerProcess: ChildProcess | null = null;

// Check if a process is actually alive by PID
function isProcessAlive(pid: number): boolean {
    try { process.kill(pid, 0); return true; } catch { return false; }
}

// Kill whatever process is holding a given pid (Windows-safe)
function killProcess(pid: number) {
    try {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: true, windowsHide: true });
        } else {
            process.kill(pid, 'SIGTERM');
        }
    } catch { /* already dead */ }
}

// Get the real running PID — from module variable OR from PID file (survives hot-reload)
function getRunningPid(): number | null {
    // Module-level process still alive
    if (listenerProcess && listenerProcess.exitCode === null && listenerProcess.pid) {
        return listenerProcess.pid;
    }
    // Fall back to PID file (survives Next.js hot-reload)
    if (fs.existsSync(PID_FILE)) {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'));
        if (!isNaN(pid) && isProcessAlive(pid)) return pid;
        // Stale file — clean up
        fs.unlinkSync(PID_FILE);
    }
    return null;
}

export async function GET() {
    const pid = getRunningPid();
    return NextResponse.json({ isRunning: pid !== null });
}

export async function POST(request: Request) {
    try {
        const { action } = await request.json();

        if (action === 'start') {
            const pid = getRunningPid();
            if (pid !== null) {
                return NextResponse.json({ success: false, message: 'Listener is already running' });
            }

            // Clear log
            fs.writeFileSync(LOG_FILE, '');
            const logFd = fs.openSync(LOG_FILE, 'w');

            listenerProcess = spawn('npx', ['tsx', 'src/backend/udpListener.ts'], {
                shell: true,
                windowsHide: true,
                stdio: ['ignore', logFd, logFd],
                env: { ...process.env },
            });

            listenerProcess.on('error', (err) => {
                console.error('Listener spawn error:', err);
                listenerProcess = null;
                if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
            });

            listenerProcess.on('close', () => {
                listenerProcess = null;
                if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
                try { fs.closeSync(logFd); } catch { /* already closed */ }
            });

            // Save PID to file so it survives hot-reloads
            if (listenerProcess.pid) {
                fs.writeFileSync(PID_FILE, String(listenerProcess.pid));
                return NextResponse.json({ success: true, message: 'Listener started' });
            }

            return NextResponse.json({ success: false, message: 'Failed to get listener PID' });

        } else if (action === 'stop') {
            const pid = getRunningPid();
            if (pid === null) {
                return NextResponse.json({ success: false, message: 'Listener is not running' });
            }
            killProcess(pid);
            listenerProcess = null;
            if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
            return NextResponse.json({ success: true, message: 'Listener stopped' });
        }

        return NextResponse.json({ success: false, message: 'Unknown action' });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

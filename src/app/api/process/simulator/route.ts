import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SIM_LOG_FILE = path.join(process.cwd(), '.simulator_logs');

export async function GET() {
    // Return the current simulator log file contents
    try {
        if (!fs.existsSync(SIM_LOG_FILE)) {
            return NextResponse.json({ logs: '' });
        }
        const logs = fs.readFileSync(SIM_LOG_FILE, 'utf-8');
        return NextResponse.json({ logs });
    } catch (err: any) {
        return NextResponse.json({ logs: '' });
    }
}

export async function POST() {
    // Clear old log, then run the simulator and stream output to a file
    fs.writeFileSync(SIM_LOG_FILE, '');

    return new Promise<Response>((resolve) => {
        const logFd = fs.openSync(SIM_LOG_FILE, 'w');

        const child = spawn('npx', ['tsx', 'src/backend/udpSimulator.ts'], {
            shell: true,
            windowsHide: true,  // ← no separate CMD window
            stdio: ['ignore', logFd, logFd],
            env: { ...process.env },
        });

        child.on('error', (err) => {
            fs.closeSync(logFd);
            resolve(
                NextResponse.json({ success: false, error: err.message }, { status: 500 }) as unknown as Response
            );
        });

        child.on('close', (code) => {
            fs.closeSync(logFd);
            const logs = fs.existsSync(SIM_LOG_FILE) ? fs.readFileSync(SIM_LOG_FILE, 'utf-8') : '';
            resolve(
                NextResponse.json({ success: code === 0, logs }) as unknown as Response
            );
        });
    });
}

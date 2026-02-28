import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();

        // Check the current connection state
        const state = mongoose.connection.readyState;
        const statusMap: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized',
        };

        const status = statusMap[state] || 'unknown';

        if (state === 1) {
            return NextResponse.json({
                success: true,
                message: 'MongoDB connected successfully!',
                status,
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: false,
                message: 'MongoDB connection is not fully established.',
                status,
            }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'MongoDB connection failed.',
            error: error.message || String(error),
        }, { status: 500 });
    }
}

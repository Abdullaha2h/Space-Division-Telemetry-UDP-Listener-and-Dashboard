import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Telemetry from '@/models/Telemetry';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const satellite_id = searchParams.get('satellite_id');

    if (!satellite_id) {
        return NextResponse.json({ error: 'satellite_id is required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const latest = await Telemetry.findOne({ satellite_id: Number(satellite_id) })
            .sort({ timestamp: -1 });

        if (!latest) {
            return NextResponse.json({ error: 'No telemetry found for satellite_id' }, { status: 404 });
        }

        return NextResponse.json(latest);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

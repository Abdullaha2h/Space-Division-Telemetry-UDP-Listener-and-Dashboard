import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const satellite_id = searchParams.get('satellite_id');

    if (!satellite_id) {
        return NextResponse.json({ error: 'satellite_id is required' }, { status: 400 });
    }

    try {
        await dbConnect();

        // Fetch all active alerts for this satellite, sorted newest first
        const alerts = await Alert.find({ satellite_id: Number(satellite_id) })
            .sort({ timestamp: -1 })
            .limit(200);

        return NextResponse.json(alerts);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Telemetry from '@/models/Telemetry';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const satellite_id = searchParams.get('satellite_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const sort = searchParams.get('sort') ?? 'desc'; // 'asc' or 'desc'

    if (!satellite_id) {
        return NextResponse.json({ error: 'satellite_id is required' }, { status: 400 });
    }

    try {
        await dbConnect();

        // Build the time filter only when both dates are provided and valid
        const query: Record<string, any> = { satellite_id: Number(satellite_id) };

        if (from || to) {
            const timeFilter: Record<string, Date> = {};
            if (from) {
                const fromDate = new Date(from);
                if (isNaN(fromDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid datetime format for from' }, { status: 400 });
                }
                timeFilter.$gte = fromDate;
            }
            if (to) {
                const toDate = new Date(to);
                if (isNaN(toDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid datetime format for to' }, { status: 400 });
                }
                timeFilter.$lte = toDate;
            }
            query.timestamp = timeFilter;
        }

        const history = await Telemetry.find(query).sort({ timestamp: sort === 'asc' ? 1 : -1 });

        return NextResponse.json(history);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

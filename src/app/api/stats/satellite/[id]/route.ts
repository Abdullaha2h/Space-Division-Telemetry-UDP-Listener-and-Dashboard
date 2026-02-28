import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Telemetry from '@/models/Telemetry';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: 'satellite_id is required' }, { status: 400 });
    }

    const satIdNum = Number(id);
    if (isNaN(satIdNum)) {
        return NextResponse.json({ error: 'Invalid satellite id format' }, { status: 400 });
    }

    try {
        await dbConnect();

        // Aggregation pipeline to get stats for a given satellite
        const stats = await Telemetry.aggregate([
            { $match: { satellite_id: satIdNum } },
            {
                $group: {
                    _id: "$satellite_id",
                    average_battery_voltage: { $avg: "$battery_voltage" },
                    max_msi_temperature: { $max: "$msi_temperature" },
                    min_msi_temperature: { $min: "$msi_temperature" },
                    total_packets: { $count: {} }
                }
            }
        ]);

        if (!stats || stats.length === 0) {
            return NextResponse.json({ message: 'No telemetry stats available for this satellite' }, { status: 404 });
        }

        const { _id, average_battery_voltage, max_msi_temperature, min_msi_temperature, total_packets } = stats[0];

        return NextResponse.json({
            satellite_id: _id,
            average_battery_voltage,
            max_msi_temperature,
            min_msi_temperature,
            total_packets
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

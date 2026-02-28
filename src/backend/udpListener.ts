import dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true });

import dgram from 'dgram';
import dbConnect from '../lib/mongodb';
import Telemetry from '../models/Telemetry';
import Alert from '../models/Alert';
import { parseTelemetryPacket } from './parser';
import { checkHealth } from './healthMonitor';

const PORT = Number(process.env.UDP_PORT) || 3333;
const HOST = process.env.UDP_HOST || '0.0.0.0';

const server = dgram.createSocket('udp4');

server.on('listening', () => {
    const addr = server.address();
    console.log(`🚀 UDP Listener running on ${addr.address}:${addr.port}`);
});

server.on('message', async (msg, rinfo) => {

    console.log(`📡 Packet received from ${rinfo.address}:${rinfo.port}`);

    try {
        const hexString = msg.toString('utf-8').trim();

        const parsed = parseTelemetryPacket(hexString);
        console.log('✅ Parsed:', parsed);

        await dbConnect();

        await new Telemetry(parsed).save();

        const alert = checkHealth(parsed);

        if (alert) {
            await new Alert({
                satellite_id: parsed.satellite_id,
                timestamp: parsed.timestamp,
                alert_level: alert.alert_level,
                message: alert.message
            }).save();

            console.log(`⚠ ALERT: ${alert.message}`);
        }

    } catch (err: any) {
        console.warn(`❌ Telemetry processing failed: ${err.message}`);
    }
});

server.on('error', err => {
    console.error('UDP Error:', err);
    server.close();
});

server.bind(PORT, HOST);

export default server;
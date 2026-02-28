import dgram from 'dgram';
import { crc16xmodem } from 'crc';

const PORT = 3333;
const HOST = '127.0.0.1';

const SYNC_HEADER = Buffer.from([0x1A, 0xCF]);
const PACKET_TYPE_HOUSEKEEPING = 0x10;

const client = dgram.createSocket('udp4');

function generatePacket(
  satellite_id: number,
  msiTemp: number,
  batteryMv: number
): string {

  const buffer = Buffer.alloc(20);

  // Sync
  SYNC_HEADER.copy(buffer, 0);

  // Length
  buffer.writeUInt8(20, 2);

  // Type
  buffer.writeUInt8(PACKET_TYPE_HOUSEKEEPING, 3);

  // Satellite ID
  buffer.writeUInt16BE(satellite_id, 4);

  // Timestamp (seconds)
  buffer.writeUInt32BE(Math.floor(Date.now()/1000), 6);

  // Payload
  buffer.writeUInt16BE(batteryMv, 10);
  buffer.writeInt8(30, 12);
  buffer.writeUInt8(msiTemp, 13);
  buffer.writeUInt32BE(512, 14);

  // CRC
  const crc = crc16xmodem(buffer.subarray(0,18));
  buffer.writeUInt16BE(crc, 18);

  return buffer.toString('hex').toUpperCase();
}

console.log("🛰 Starting Telemetry Simulator...");

let count = 0;

const interval = setInterval(() => {

  if (count >= 10) {
    clearInterval(interval);
    client.close();
    console.log("✅ Simulation complete");
    return;
  }

  const temp = Math.random() < 0.2 ? 45 : 25;
  const batt = Math.random() < 0.2 ? 11000 : 13000;

  const hex = generatePacket(101, temp, batt);

  client.send(Buffer.from(hex, 'utf-8'), PORT, HOST);

  console.log(`📤 Sent packet ${count+1}: ${hex}`);

  count++;

}, 1000);
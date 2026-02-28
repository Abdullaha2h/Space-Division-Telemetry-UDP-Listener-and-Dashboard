import { crc16xmodem } from 'crc';

export interface HousekeepingParams {
  satellite_id: number;
  timestamp: Date;
  battery_voltage: number;
  battery_temp: number;
  msi_temperature: number;
  ssr_used: number;
}

export const SYNC_HEADER = 0x1ACF;
export const PACKET_TYPE_HOUSEKEEPING = 0x10;
export const HOUSEKEEPING_PACKET_LENGTH = 20;

export function parseTelemetryPacket(hexString: string): HousekeepingParams {

  const cleanHex = hexString.replace(/\s+/g, '').replace(/^0x/i, '');
  const buffer = Buffer.from(cleanHex, 'hex');

  // ---- Length Check ----
  if (buffer.length !== HOUSEKEEPING_PACKET_LENGTH) {
    throw new Error(`Invalid packet size ${buffer.length}`);
  }

  // ---- Sync Header ----
  const sync = buffer.readUInt16BE(0);
  if (sync !== SYNC_HEADER) {
    throw new Error('Invalid Sync Header');
  }

  // ---- Packet Length ----
  const packetLength = buffer.readUInt8(2);
  if (packetLength !== HOUSEKEEPING_PACKET_LENGTH) {
    throw new Error('Packet length mismatch');
  }

  // ---- Type ----
  const type = buffer.readUInt8(3);
  if (type !== PACKET_TYPE_HOUSEKEEPING) {
    throw new Error('Unsupported packet type');
  }

  // ---- CRC Validation ----
  const receivedCRC = buffer.readUInt16BE(18);
  const calculatedCRC = crc16xmodem(buffer.subarray(0, 18));

  if (receivedCRC !== calculatedCRC) {
    throw new Error('CRC validation failed');
  }

  // ---- Extract Fields ----
  const satellite_id = buffer.readUInt16BE(4);
  const timestampSeconds = buffer.readUInt32BE(6);

  return {
    satellite_id,
    timestamp: new Date(timestampSeconds * 1000),
    battery_voltage: buffer.readUInt16BE(10),
    battery_temp: buffer.readInt8(12),
    msi_temperature: buffer.readUInt8(13),
    ssr_used: buffer.readUInt32BE(14),
  };
}
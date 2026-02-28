import { parseTelemetryPacket } from './parser';

export function checkHealth(packet: any) {
    if (packet.msi_temperature > 40) {
        return { alert_level: 'Red', message: `MSI Temperature is critical at ${packet.msi_temperature}°C` };
    }
    if (packet.battery_voltage < 12000) {
        return { alert_level: 'Yellow', message: `Battery Voltage is low at ${packet.battery_voltage}mV` };
    }
    return null;
}

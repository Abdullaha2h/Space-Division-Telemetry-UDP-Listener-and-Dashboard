import mongoose from 'mongoose';

const TelemetrySchema = new mongoose.Schema({
    satellite_id: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    msi_temperature: { type: Number, required: true },
    battery_voltage: { type: Number, required: true },
    battery_temp: { type: Number, required: true },
    ssr_used: { type: Number, required: true },
}, {
    timestamps: true // createdAt and updatedAt
});

// Index for fast quering by satellite_id and time range
TelemetrySchema.index({ satellite_id: 1, timestamp: -1 });

export default mongoose.models.Telemetry || mongoose.model('Telemetry', TelemetrySchema);

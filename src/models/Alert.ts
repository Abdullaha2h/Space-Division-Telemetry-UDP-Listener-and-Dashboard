import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    satellite_id: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    alert_level: { type: String, enum: ['Red', 'Yellow'], required: true },
    message: { type: String, required: true },
}, {
    timestamps: true
});

// Avoid duplicate alerts at the same timestamp for a given satellite
AlertSchema.index({ satellite_id: 1, timestamp: -1, alert_level: 1 }, { unique: true });

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema);

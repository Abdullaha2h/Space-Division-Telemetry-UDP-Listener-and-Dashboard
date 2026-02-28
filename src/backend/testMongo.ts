import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ MONGODB_URI is not defined in .env.local");
        process.exit(1);
    }

    try {
        console.log("Attempting to connect to MongoDB using URI:", uri.replace(/:([^:@]{3,})@/, ':****@')); // Hide password in logs
        await mongoose.connect(uri);
        console.log("✅ Successfully connected to MongoDB!");

        // Ping the database
        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
            console.log("✅ Successfully pinged the database.");
        }

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:");
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log("Connection closed.");
    }
}

testConnection();

async function testApis() {
    const SATELLITE_ID = 101;
    const BASE_URL = 'http://localhost:3000/api';

    console.log("=== Testing Latest Telemetry ===");
    const resLatest = await fetch(`${BASE_URL}/telemetry/latest?satellite_id=${SATELLITE_ID}`);
    console.log("Status:", resLatest.status);
    console.log(await resLatest.json());

    console.log("\n=== Testing Telemetry History ===");
    const now = new Date();
    const from = new Date(now.getTime() - 1000 * 60 * 60).toISOString(); // 1 hour ago
    const to = now.toISOString();

    const resHistory = await fetch(`${BASE_URL}/telemetry/history?satellite_id=${SATELLITE_ID}&from=${from}&to=${to}`);
    console.log("Status:", resHistory.status);
    const histData = await resHistory.json();
    console.log(`Found ${histData.length} records.`);

    console.log("\n=== Testing Alerts ===");
    const resAlerts = await fetch(`${BASE_URL}/alerts?satellite_id=${SATELLITE_ID}`);
    console.log("Status:", resAlerts.status);
    const alertsData = await resAlerts.json();
    console.log(`Found ${alertsData.length} alerts.`);
    if (alertsData.length > 0) console.log(alertsData[0]); // Print latest alert

    console.log("\n=== Testing Stats ===");
    const resStats = await fetch(`${BASE_URL}/stats/satellite/${SATELLITE_ID}`);
    console.log("Status:", resStats.status);
    console.log(await resStats.json());
}

testApis().catch(console.error);

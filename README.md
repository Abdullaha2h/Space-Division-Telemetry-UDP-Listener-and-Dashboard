# Space Division Telemetry Task

A comprehensive system for processing space telemetry data, built with Next.js, React, Node.js (UDP), and MongoDB. This project includes a sophisticated hex packet parser, a real-time UDP ingestion service with an interactive dashboard, automated health monitoring alerts, and a full REST API for historical data retrieval.

---

## 🚀 How to Run the Project

### Prerequisites

1. **Node.js** 
2. **MongoDB** instance (Atlas)

### 1. Installation & Environment

Clone the repository and install dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory and add your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/space_telemetry
```

### 2. Start the Development Server

Run the Next.js frontend and API routes:

```bash
npm run dev
```

The application dashboard will be available at `http://localhost:3000`.

---

## 📡 Running the UDP Listener & Simulator

The system includes a dedicated backend for receiving raw telemetry frames via UDP and a simulator to generate mock satellite Housekeeping (0x10) packets.

### From the Dashboard (Recommended)

You can directly control the UDP Listener and Simulator from the **Process Control** panel on the web dashboard:

1. Open `http://localhost:3000`
2. Click **Start Listener** (starts listening on `0.0.0.0:3333`)
3. Click **Run Simulator** (transmits 10 randomized 0x10 hex packets to the listener)
4. Watch the Dashboard update with Live Telemetry and Active Alerts in real-time.

### From the Command Line

Alternatively, you can run them manually in separate terminal windows:

**Start the UDP Listener:**

```bash
npm run udp
```

_(Listens on port 3333 and saves parsed valid packets and alerts to MongoDB)_

**Run the UDP Simulator:**

```bash
npm run simulate
```

_(Sends 10 mock UDP telemetry packets to the listener)_

---

## 📋 Task Description & Implementation

This system satisfies the following core architecture requirements:

### 1. Parser Development

A robust parser that:

- Takes a raw hex string as input.
- Validates the sync header (`0xAA`), calculates and verifies the packet length, and validates the CRC checksum.
- Parses the packet based on its type.
- For **Housekeeping packets (`0x10`)**, extracts the fields (Satellite ID, Battery Voltage, MSI Temperature) and returns a structured object.
- Gracefully handles malformed or incomplete packets without crashing the service.

### 2. UDP Ingestion Service

- Implements a UDP listener binding to a configurable port (`3333`).
- Processes incoming hexadecimal telemetry frames in real-time.
- Efficiently handles multiple packets continuously arriving in a stream.

### 3. Health Monitor Logic

An alerting function that runs upon successfully parsing a Housekeeping packet:

- **Red Alert:** Triggered if `msi_temperature > 40°C`.
- **Yellow Alert:** Triggered if `battery_voltage < 12000 mV`.
- Returns the appropriate alert level and a descriptive diagnostic message.
- Triggers are immediately stored in the database for tracking.

### 4. MongoDB Integration

- Defined Mongoose schemas for storing parsed telemetry packets and alerts.
- Stores all valid Housekeeping packets in the `telemetries` collection.
- Stores triggered alerts in the `alerts` collection.
- Uses appropriate indexing (e.g., compounding `satellite_id` and `timestamp` for fast retrieval).
- Includes logic to mitigate duplicate active alerts spam (e.g., upserting/cooldown periods depending on the alert definition).

### 5. REST API Development

Exposes the following API routes:

- `GET /api/telemetry/latest?satellite_id=ID`
  - Returns the single most recent telemetry record for the specified satellite.
- `GET /api/telemetry/history?satellite_id=ID&from=TS&to=TS`
  - Returns telemetry data within the specified ISO time range.
- `GET /api/alerts?satellite_id=ID`
  - Returns all active alerts for a satellite.
- `GET /api/stats/satellite/:id`
  - Returns aggregated statistics (Average battery voltage, Maximum MSI temperature, total packets received).
  - Built utilizing **MongoDB Aggregation Pipelines** (`$group`, `$avg`, `$max`).

### 6. GUI / Dashboard

A modern, dark-themed Ground Control Interface that:

- Displays live, up-to-date telemetry values.
- Displays current alert statuses clearly with color-coding (`Red` vs `Yellow`).
- Provides a dedicated modal for viewing Historical Data (paginated table view with real-time sorting and date-range filters).
- Features built-in Process Controls to start/stop the UDP ingestion listener directly from the browser.

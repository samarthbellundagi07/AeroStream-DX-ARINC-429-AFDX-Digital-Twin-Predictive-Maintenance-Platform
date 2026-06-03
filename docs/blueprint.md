# **App Name**: AeroStream DX

## Core Features:

- Live Bus Telemetry Engine: Simulates real-time ARINC 429 word generation and AFDX frame sequencing to create an active monitoring stream.
- Protocol Diagnostic Terminal: A live-filtering interface to decode bit-level data, including Label, SDI, SSM, and Virtual Link identifiers.
- Intelligent Maintenance Tool: A generative AI-powered tool that analyzes bus data patterns to suggest potential mechanical root causes for detected anomalies.
- Manual Fault Injector: Trigger-controlled injection of parity errors, CRC failures, and BAG violations for stress testing monitoring protocols.
- Performance Oscilloscope: Real-time data visualizations for bus utilization, frame latency, and jitter statistics.
- Aerospace Artifact Archival: Persistent storage of mission data, bus events, and anomaly history using a PostgreSQL database.
- Digital Twin Status Dashboard: High-level overview of critical subsystems like Engine and Hydraulic systems powered by bus simulation feedback.

## Style Guidelines:

- Primary Color: Precision Blue (#3094E8), a vibrant cobalt reflecting the glow of high-end cockpit flight instruments.
- Background Color: Deep Space Charcoal (#111317), a dark, low-contrast canvas optimized for low-light maintenance environments.
- Accent Color: Data Cyan (#59F2F2), used for diagnostic readouts and healthy system status indicators to provide high readability against the primary.
- Headline and Digital Readout font: 'Space Grotesk' for a technical, HUD-inspired feel; Body and table data: 'Inter' for neutral readability.
- Bus Stream font: 'Source Code Pro' specifically for raw 32-bit ARINC words and AFDX hex-dumps.
- A dashboard-first modular layout with side-panes for system hierarchy and a centralized wide-view telemetry stream.
- Subtle, rhythmic scanning animations across the telemetry feed to indicate live data connection.
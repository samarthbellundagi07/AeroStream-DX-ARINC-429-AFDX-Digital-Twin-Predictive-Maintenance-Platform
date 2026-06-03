export type SSM = 'FW' | 'NCD' | 'FT' | 'NO'; // Failure Warning, No Computed Data, Functional Test, Normal Operation

export interface Arinc429Word {
  id: string;
  timestamp: string;
  label: string; // Octal representation (0-377)
  sdi: string;   // Source/Destination Identifier (2 bits)
  data: string;  // Data field (19 bits)
  ssm: SSM;
  parity: number; // 1 or 0 (Odd parity)
  raw: string;    // 32-bit hex representation
  isValid: boolean;
  engineeringValue?: number;
  unit?: string;
  error?: string;
}

export interface AfdxFrame {
  id: string;
  timestamp: string;
  vlid: number;       // Virtual Link ID
  sequenceNumber: number;
  payloadSize: number;
  payload: string;    // Hex payload
  bag: number;        // Bandwidth Allocation Gap (ms)
  isCompliant: boolean;
  crc: string;
  isValid: boolean;
  jitter: number;     // ms
  latency: number;    // ms
  error?: string;
}

export interface SubsystemStatus {
  id: string;
  name: string;
  health: 'Nominal' | 'Degraded' | 'Critical';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  remainingUsefulLife: number; // Hours
  nextMaintenanceDate: string;
  riskScore: number; // 0-100
}

export interface Defect {
  id: string;
  timestamp: string;
  subsystem: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved';
  recommendation?: string;
}

export interface FaultConfig {
  id: string;
  name: string;
  type: 'ARINC' | 'AFDX' | 'SYSTEM';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  active: boolean;
}

export interface BusMetrics {
  timestamp: string;
  throughput: number;
  latency: number;
  packetRate: number;
  utilization: number;
  errorRate: number;
  arincRate: number;
  afdxRate: number;
  anomalyCount: number;
}

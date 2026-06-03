export type SSM = 'FW' | 'NCD' | 'FT' | 'NO'; // Failure Warning, No Computed Data, Functional Test, Normal Operation

export interface Arinc429Word {
  id: string;
  timestamp: string;
  label: string; // Octal representation (0-377)
  sdi: string;   // Source/Destination Identifier (2 bits)
  data: string;  // Data field (19 bits)
  ssm: SSM;
  parity: number; // 1 or 0
  raw: string;    // 32-bit hex
  isValid: boolean;
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
  error?: string;
}

export interface SubsystemStatus {
  id: string;
  name: string;
  health: 'Nominal' | 'Degraded' | 'Critical';
  value: number;
  unit: string;
}

export interface FaultConfig {
  type: string;
  rate: number;
  duration: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  active: boolean;
}

export interface BusMetrics {
  throughput: number;
  latency: number;
  packetRate: number;
  utilization: number;
  errorRate: number;
}

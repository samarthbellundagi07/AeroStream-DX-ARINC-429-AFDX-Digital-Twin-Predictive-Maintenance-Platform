import { Arinc429Word, AfdxFrame, SSM, SubsystemStatus, Defect } from './types';

export class BusSimulator {
  private static labels = ['102', '203', '270', '310', '311', '060'];
  private static vlids = [100, 200, 300, 400, 500];
  private static seqNumbers: Record<number, number> = {};

  // ARINC 429 Protocol Engine Logic
  static calculateParity(word31Bits: string): number {
    const onesCount = (word31Bits.match(/1/g) || []).length;
    // ARINC 429 uses ODD parity. If count is even, parity bit is 1. If odd, parity bit is 0.
    return onesCount % 2 === 0 ? 1 : 0;
  }

  static generateArincWord(activeFaults: any[] = []): Arinc429Word {
    const labelOctal = this.labels[Math.floor(Math.random() * this.labels.length)];
    const sdi = (Math.floor(Math.random() * 4)).toString(2).padStart(2, '0');
    
    // Engineering values simulation
    let engValue = 0;
    let unit = '';
    if (labelOctal === '310') { engValue = 35000 + Math.random() * 100; unit = 'FT'; }
    if (labelOctal === '203') { engValue = 450 + Math.random() * 5; unit = 'KTS'; }
    
    const dataVal = Math.floor(Math.random() * 524287);
    const dataBits = dataVal.toString(2).padStart(19, '0');
    const ssm: SSM = Math.random() > 0.98 ? 'NCD' : 'NO';
    
    // Construct 31 bits for parity calculation
    const word31Bits = labelOctal.split('').map(c => parseInt(c, 8).toString(2).padStart(3, '0')).join('') + sdi + dataBits + (ssm === 'NO' ? '00' : '11');
    let parity = this.calculateParity(word31Bits);
    
    let isValid = true;
    let error = undefined;

    // Fault Injection: Parity Error
    if (activeFaults.some(f => f.name === 'Parity Error' && f.active)) {
      if (Math.random() < 0.3) {
        parity = parity === 1 ? 0 : 1; // Flip parity
        isValid = false;
        error = 'Bit 32 Parity Check Failed (Expected Odd)';
      }
    }

    const raw = `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      label: labelOctal,
      sdi,
      data: dataBits,
      ssm,
      parity,
      raw,
      isValid,
      engineeringValue: engValue || undefined,
      unit: unit || undefined,
      error
    };
  }

  // AFDX Protocol Engine Logic
  static generateAfdxFrame(activeFaults: any[] = []): AfdxFrame {
    const vlid = this.vlids[Math.floor(Math.random() * this.vlids.length)];
    
    // Track sequence numbers per VL
    if (this.seqNumbers[vlid] === undefined) this.seqNumbers[vlid] = 0;
    const sequenceNumber = this.seqNumbers[vlid];
    this.seqNumbers[vlid] = (this.seqNumbers[vlid] + 1) % 256;

    const bag = vlid === 100 ? 32 : 64;
    let isValid = true;
    let isCompliant = true;
    let error = undefined;
    let jitter = Math.random() * 0.05;

    // Fault Injection: CRC Failure
    if (activeFaults.some(f => f.name === 'CRC Failure' && f.active)) {
      if (Math.random() < 0.2) {
        isValid = false;
        error = 'CRC-32 Integrity Violation';
      }
    }

    // Fault Injection: BAG Violation (Timing)
    if (activeFaults.some(f => f.name === 'BAG Violation' && f.active)) {
      if (Math.random() < 0.3) {
        jitter = bag + 5; // Force jitter beyond BAG
        isCompliant = false;
        error = 'Virtual Link Timing Violation (BAG Overrun)';
      }
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      vlid,
      sequenceNumber,
      payloadSize: 64 + Math.floor(Math.random() * 400),
      payload: `A5 B2 ${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`,
      bag,
      isCompliant,
      crc: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
      isValid,
      jitter,
      latency: 0.8 + Math.random() * 0.4,
      error
    };
  }

  static getSubsystemStatus(): SubsystemStatus[] {
    const randomTrend = () => (Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'down' : 'stable') as any;
    const now = new Date();
    
    return [
      { 
        id: 'eng-1', 
        name: 'Engine #1 N1', 
        health: 'Nominal', 
        value: 92.4 + (Math.random() - 0.5), 
        unit: '%', 
        trend: randomTrend(),
        remainingUsefulLife: 1240,
        nextMaintenanceDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        riskScore: 12
      },
      { 
        id: 'hyd-a', 
        name: 'Hydraulic Sys A', 
        health: 'Nominal', 
        value: 3000 + (Math.random() * 10 - 5), 
        unit: 'PSI', 
        trend: randomTrend(),
        remainingUsefulLife: 850,
        nextMaintenanceDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        riskScore: 24
      },
      { 
        id: 'elec-dc', 
        name: 'DC Bus 1', 
        health: 'Nominal', 
        value: 28.1 + (Math.random() * 0.2 - 0.1), 
        unit: 'V', 
        trend: randomTrend(),
        remainingUsefulLife: 3200,
        nextMaintenanceDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        riskScore: 5
      },
      { 
        id: 'fuel-ctr', 
        name: 'Center Fuel Tank', 
        health: 'Nominal', 
        value: 4480 - (Math.random() * 2), 
        unit: 'LBS', 
        trend: randomTrend(),
        remainingUsefulLife: 5000,
        nextMaintenanceDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        riskScore: 2
      },
    ];
  }

  static getDefectHistory(): Defect[] {
    return [
      {
        id: 'DEF-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        subsystem: 'Avionics',
        description: 'Repeated ARINC 429 Parity Errors on Bus 1 (Label 310)',
        severity: 'Medium',
        status: 'Investigating',
        recommendation: 'Check cable shielding and connector seat at LRU 42.'
      },
      {
        id: 'DEF-002',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        subsystem: 'Hydraulic',
        description: 'Hydraulic Pump A Pressure Fluctuations',
        severity: 'High',
        status: 'Open',
        recommendation: 'Replace filter element and inspect for leakages in the primary manifold.'
      }
    ];
  }
}

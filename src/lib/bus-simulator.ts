import { Arinc429Word, AfdxFrame, SSM, SubsystemStatus, Defect, FlightScenario } from './types';

export class BusSimulator {
  private static labels = ['102', '203', '270', '310', '311', '060'];
  private static vlids = [100, 200, 300, 400, 500];
  private static seqNumbers: Record<number, number> = {};
  private static currentScenario: FlightScenario = 'NORMAL';

  static setScenario(scenario: FlightScenario) {
    this.currentScenario = scenario;
  }

  static getScenario() {
    return this.currentScenario;
  }

  // ARINC 429 Protocol Engine Logic
  static calculateParity(word31Bits: string): number {
    const onesCount = (word31Bits.match(/1/g) || []).length;
    // ARINC 429 uses ODD parity. If count is even, parity bit is 1.
    return onesCount % 2 === 0 ? 1 : 0;
  }

  static generateArincWord(activeFaults: any[] = []): Arinc429Word {
    const labelOctal = this.labels[Math.floor(Math.random() * this.labels.length)];
    const sdi = (Math.floor(Math.random() * 4)).toString(2).padStart(2, '0');
    
    // Engineering values simulation based on scenario
    let engValue = 0;
    let unit = '';
    
    if (labelOctal === '310') { 
      engValue = 35000 + Math.random() * 100; 
      unit = 'FT'; 
    }
    if (labelOctal === '203') { 
      engValue = 450 + Math.random() * 5; 
      if (this.currentScenario === 'HYDRAULIC_FAILURE') engValue -= 20; // Drag increase?
      unit = 'KTS'; 
    }
    
    const dataVal = Math.floor(Math.random() * 524287);
    const dataBits = dataVal.toString(2).padStart(19, '0');
    const ssm: SSM = Math.random() > 0.98 ? 'NCD' : 'NO';
    
    const labelBits = labelOctal.split('').map(c => parseInt(c, 8).toString(2).padStart(3, '0')).join('');
    const word31Bits = labelBits + sdi + dataBits + (ssm === 'NO' ? '00' : '11');
    let parity = this.calculateParity(word31Bits);
    
    let isValid = true;
    let error = undefined;

    // Fault Injection
    if (activeFaults.some(f => f.name === 'Parity Error' && f.active) || this.currentScenario === 'ELECTRICAL_BUS_FAIL') {
      if (Math.random() < 0.2) {
        parity = parity === 1 ? 0 : 1;
        isValid = false;
        error = 'Bit 32 Parity Check Failed';
      }
    }

    const binary = word31Bits + parity;
    const raw = `0x${parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0')}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      label: labelOctal,
      sdi,
      data: dataBits,
      ssm,
      parity,
      raw,
      binary,
      isValid,
      engineeringValue: engValue || undefined,
      unit: unit || undefined,
      error
    };
  }

  static generateAfdxFrame(activeFaults: any[] = []): AfdxFrame {
    const vlid = this.vlids[Math.floor(Math.random() * this.vlids.length)];
    if (this.seqNumbers[vlid] === undefined) this.seqNumbers[vlid] = 0;
    const sequenceNumber = this.seqNumbers[vlid];
    this.seqNumbers[vlid] = (this.seqNumbers[vlid] + 1) % 256;

    const bag = vlid === 100 ? 32 : 64;
    let isValid = true;
    let isCompliant = true;
    let error = undefined;
    let jitter = Math.random() * 0.05;

    if (activeFaults.some(f => f.name === 'CRC Failure' && f.active)) {
      if (Math.random() < 0.2) { isValid = false; error = 'CRC-32 Violation'; }
    }

    if (this.currentScenario === 'ELECTRICAL_BUS_FAIL' && Math.random() < 0.1) {
      isValid = false;
      error = 'Signal Integrity Lost';
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      vlid,
      sequenceNumber,
      payloadSize: 64,
      payload: 'A5B2',
      bag,
      isCompliant,
      crc: '0xDEADBEEF',
      isValid,
      jitter,
      latency: 0.8 + Math.random() * 0.4,
      error
    };
  }

  static getSubsystemStatus(): SubsystemStatus[] {
    const randomTrend = () => (Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'down' : 'stable') as any;
    const now = new Date();
    
    const baseHealth = (name: string) => {
      if (this.currentScenario === 'ENGINE_OVERHEAT' && name.includes('Engine')) return 220 + Math.random() * 50;
      if (this.currentScenario === 'HYDRAULIC_FAILURE' && name.includes('Hydraulic')) return 1200 + Math.random() * 100;
      if (this.currentScenario === 'FUEL_LEAK' && name.includes('Fuel')) return 2000 - (Date.now() % 1000);
      
      if (name.includes('Engine')) return 92.4;
      if (name.includes('Hydraulic')) return 3000;
      if (name.includes('DC')) return 28.1;
      if (name.includes('Fuel')) return 4480;
      return 0;
    };

    return [
      { 
        id: 'eng-1', name: 'Engine #1 N1', health: this.currentScenario === 'ENGINE_OVERHEAT' ? 'Critical' : 'Nominal', 
        value: baseHealth('Engine'), unit: '%', trend: this.currentScenario === 'ENGINE_OVERHEAT' ? 'up' : 'stable',
        remainingUsefulLife: this.currentScenario === 'ENGINE_OVERHEAT' ? 50 : 1240,
        nextMaintenanceDate: '2025-06-15', riskScore: this.currentScenario === 'ENGINE_OVERHEAT' ? 95 : 12,
        failureProbability: this.currentScenario === 'ENGINE_OVERHEAT' ? 0.85 : 0.02
      },
      { 
        id: 'hyd-a', name: 'Hydraulic Sys A', health: this.currentScenario === 'HYDRAULIC_FAILURE' ? 'Degraded' : 'Nominal', 
        value: baseHealth('Hydraulic'), unit: 'PSI', trend: this.currentScenario === 'HYDRAULIC_FAILURE' ? 'down' : 'stable',
        remainingUsefulLife: this.currentScenario === 'HYDRAULIC_FAILURE' ? 10 : 850,
        nextMaintenanceDate: '2025-04-10', riskScore: this.currentScenario === 'HYDRAULIC_FAILURE' ? 88 : 24,
        failureProbability: this.currentScenario === 'HYDRAULIC_FAILURE' ? 0.72 : 0.05
      },
      { 
        id: 'elec-dc', name: 'DC Bus 1', health: 'Nominal', 
        value: baseHealth('DC'), unit: 'V', trend: 'stable',
        remainingUsefulLife: 3200, nextMaintenanceDate: '2025-10-20', riskScore: 5, failureProbability: 0.01
      },
      { 
        id: 'fuel-ctr', name: 'Center Fuel Tank', health: this.currentScenario === 'FUEL_LEAK' ? 'Degraded' : 'Nominal', 
        value: baseHealth('Fuel'), unit: 'LBS', trend: this.currentScenario === 'FUEL_LEAK' ? 'down' : 'stable',
        remainingUsefulLife: 5000, nextMaintenanceDate: '2025-12-01', riskScore: 2, failureProbability: 0.01
      },
    ];
  }

  static getDefectHistory(): Defect[] {
    const defects: Defect[] = [
      {
        id: 'DEF-001',
        timestamp: new Date().toISOString(),
        subsystem: 'Avionics',
        description: 'Repeated ARINC 429 Parity Errors on Bus 1',
        severity: 'Medium',
        status: 'Investigating',
        recommendation: 'Check cable shielding at LRU 42.',
        isolationSteps: ['Verify ground loop impedance', 'Check pin continuity', 'Replace LRU connector']
      }
    ];

    if (this.currentScenario === 'HYDRAULIC_FAILURE') {
      defects.push({
        id: 'DEF-HYD-L',
        timestamp: new Date().toISOString(),
        subsystem: 'Hydraulic',
        description: 'System A Pressure Low / Quantity Depleting',
        severity: 'Critical',
        status: 'Open',
        recommendation: 'Check for visible leaks in Main Wheel Well.',
        isolationSteps: ['Inspect EDP A lines', 'Check heat exchanger integrity']
      });
    }

    return defects;
  }
}

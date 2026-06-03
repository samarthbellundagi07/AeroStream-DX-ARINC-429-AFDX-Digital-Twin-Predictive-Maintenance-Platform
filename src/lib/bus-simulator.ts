import { Arinc429Word, AfdxFrame, SSM, SubsystemStatus } from './types';

export class BusSimulator {
  private static labels = ['102', '203', '270', '310', '311', '060'];
  private static vlids = [100, 200, 300, 400, 500];

  static generateArincWord(activeFaults: any[] = []): Arinc429Word {
    const label = this.labels[Math.floor(Math.random() * this.labels.length)];
    const sdi = (Math.floor(Math.random() * 4)).toString(2).padStart(2, '0');
    const dataVal = Math.floor(Math.random() * 524287);
    const data = dataVal.toString(2).padStart(19, '0');
    const ssm: SSM = Math.random() > 0.95 ? 'NCD' : 'NO';
    const parity = Math.random() > 0.05 ? 1 : 0; 
    
    const raw = `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`;
    
    let isValid = true;
    let error = undefined;

    // Fault Injection Logic
    if (activeFaults.some(f => f.name === 'Parity Error' && f.active)) {
      if (Math.random() < 0.4) {
        isValid = false;
        error = 'Parity Bit Failure';
      }
    }
    
    if (activeFaults.some(f => f.name === 'Label Drift' && f.active)) {
      if (Math.random() < 0.3) {
        isValid = false;
        error = 'Invalid SSM Frequency';
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      label,
      sdi,
      data,
      ssm,
      parity,
      raw,
      isValid,
      error
    };
  }

  static generateAfdxFrame(activeFaults: any[] = []): AfdxFrame {
    const vlid = this.vlids[Math.floor(Math.random() * this.vlids.length)];
    const sequenceNumber = Math.floor(Math.random() * 256);
    const bag = Math.random() > 0.5 ? 128 : 64;
    
    let isValid = true;
    let isCompliant = true;
    let error = undefined;

    if (activeFaults.some(f => f.name === 'CRC Failure' && f.active)) {
      if (Math.random() < 0.3) {
        isValid = false;
        error = 'CRC-32 Checksum Mismatch';
      }
    }

    if (activeFaults.some(f => f.name === 'BAG Violation' && f.active)) {
      if (Math.random() < 0.4) {
        isCompliant = false;
        error = 'L-BAG Traffic Policing Violation';
      }
    }

    if (activeFaults.some(f => f.name === 'Missing Frames' && f.active)) {
      if (Math.random() < 0.5) {
        isValid = false;
        error = 'Sequence Integrity Error';
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      vlid,
      sequenceNumber,
      payloadSize: 64 + Math.floor(Math.random() * 1400),
      payload: `E3 4F ${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`,
      bag,
      isCompliant,
      crc: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
      isValid,
      error
    };
  }

  static getSubsystemStatus(): SubsystemStatus[] {
    const randomTrend = () => (Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'down' : 'stable') as any;
    return [
      { id: 'eng-1', name: 'Engine #1 N1', health: 'Nominal', value: 92.4 + (Math.random() - 0.5), unit: '%', trend: randomTrend() },
      { id: 'hyd-a', name: 'Hydraulic System A', health: 'Nominal', value: 3000 + (Math.random() * 10 - 5), unit: 'PSI', trend: randomTrend() },
      { id: 'elec-dc', name: 'DC Bus 1', health: 'Nominal', value: 28.1 + (Math.random() * 0.2 - 0.1), unit: 'V', trend: randomTrend() },
      { id: 'fuel-ctr', name: 'Center Fuel Tank', health: 'Nominal', value: 4500 - (Math.random() * 2), unit: 'LBS', trend: randomTrend() },
    ];
  }
}

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaultConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  active: boolean;
}

export function FaultInjector({ onFaultChange }: { onFaultChange: (faults: FaultConfig[]) => void }) {
  const [faults, setFaults] = useState<FaultConfig[]>([
    { id: 'f1', name: 'Parity Error', type: 'ARINC', description: 'Force odd parity in simulated words', active: false },
    { id: 'f2', name: 'CRC Failure', type: 'AFDX', description: 'Corrupt frame check sequence', active: false },
    { id: 'f3', name: 'BAG Violation', type: 'AFDX', description: 'Transmit frames outside scheduled slot', active: false },
    { id: 'f4', name: 'Label Drift', type: 'ARINC', description: 'Invalid SSM transition frequency', active: false },
  ]);

  const toggleFault = (id: string) => {
    const newFaults = faults.map(f => f.id === id ? { ...f, active: !f.active } : f);
    setFaults(newFaults);
    onFaultChange(newFaults);
  };

  const activeCount = faults.filter(f => f.active).length;

  return (
    <Card className="hud-border bg-background/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-headline">Fault Injection Framework</CardTitle>
        </div>
        <Badge variant={activeCount > 0 ? "destructive" : "secondary"}>
          {activeCount} ACTIVE FAULTS
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {faults.map((fault) => (
          <div key={fault.id} className={cn(
            "p-4 rounded-lg border transition-all duration-300",
            fault.active ? "bg-destructive/10 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-card border-border hover:border-primary/50"
          )}>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="text-[10px] uppercase">{fault.type}</Badge>
              <Switch checked={fault.active} onCheckedChange={() => toggleFault(fault.id)} />
            </div>
            <h4 className="font-headline text-sm font-bold mb-1">{fault.name}</h4>
            <p className="text-[11px] text-muted-foreground leading-snug">{fault.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldAlert, AlertTriangle, Radiation, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaultConfig } from "@/lib/types";

export function FaultInjector({ onFaultChange }: { onFaultChange: (faults: FaultConfig[]) => void }) {
  const [faults, setFaults] = useState<FaultConfig[]>([
    { id: 'f1', name: 'Parity Error', type: 'ARINC', description: 'Force odd parity in simulated labels', severity: 'Medium', active: false },
    { id: 'f2', name: 'CRC Failure', type: 'AFDX', description: 'Corrupt frame check sequence integrity', severity: 'High', active: false },
    { id: 'f3', name: 'BAG Violation', type: 'AFDX', description: 'Traffic policing schedule bypass', severity: 'High', active: false },
    { id: 'f4', name: 'Label Drift', type: 'ARINC', description: 'Unstable SSM transition frequency', severity: 'Medium', active: false },
    { id: 'f5', name: 'Missing Frames', type: 'AFDX', description: 'Simulate packet loss in sequence', severity: 'Critical', active: false },
    { id: 'f6', name: 'Engine Heat', type: 'SYSTEM', description: 'Thermal degradation simulation', severity: 'Low', active: false },
  ]);

  const toggleFault = (id: string) => {
    const newFaults = faults.map(f => f.id === id ? { ...f, active: !f.active } : f);
    setFaults(newFaults);
    onFaultChange(newFaults);
  };

  const activeCount = faults.filter(f => f.active).length;

  return (
    <Card className="hud-border bg-card/20 border-primary/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-primary/5 py-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-yellow-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <CardTitle className="text-sm font-headline uppercase tracking-[0.2em]">Fault Injection Framework</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <div className="flex -space-x-1">
              {[...Array(activeCount)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-destructive animate-ping" />
              ))}
            </div>
          )}
          <Badge variant={activeCount > 0 ? "destructive" : "secondary"} className="text-[10px] tracking-widest font-headline">
            {activeCount} ACTIVE FAULTS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {faults.map((fault) => (
          <div key={fault.id} className={cn(
            "p-5 rounded-xl border transition-all duration-500 group relative overflow-hidden",
            fault.active 
              ? "bg-destructive/10 border-destructive/50 shadow-[0_0_25px_rgba(239,68,68,0.15)]" 
              : "bg-background/20 border-border/50 hover:border-primary/30 hover:bg-white/5"
          )}>
            {fault.active && (
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Radiation className="w-12 h-12 text-destructive animate-spin-slow" />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-60 w-fit">
                  {fault.type} BUS
                </Badge>
                <h4 className="font-headline text-sm font-bold tracking-tight">{fault.name}</h4>
              </div>
              <Switch 
                checked={fault.active} 
                onCheckedChange={() => toggleFault(fault.id)}
                className="data-[state=checked]:bg-destructive" 
              />
            </div>
            
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4 min-h-[32px]">{fault.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
               <span className={cn(
                 "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                 fault.severity === 'Critical' ? "text-destructive border-destructive/30 bg-destructive/5" :
                 fault.severity === 'High' ? "text-orange-500 border-orange-500/30 bg-orange-500/5" :
                 "text-accent border-accent/30 bg-accent/5"
               )}>
                 {fault.severity} Impact
               </span>
               <div className={cn("w-2 h-2 rounded-full", fault.active ? "bg-destructive animate-pulse" : "bg-muted")} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

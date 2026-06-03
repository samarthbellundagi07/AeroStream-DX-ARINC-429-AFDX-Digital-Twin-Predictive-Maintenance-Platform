"use client";

import { SubsystemStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plane, Thermometer, Battery, Droplets, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusDashboardProps {
  subsystems: SubsystemStatus[];
}

export function StatusDashboard({ subsystems }: StatusDashboardProps) {
  const getIcon = (name: string) => {
    if (name.includes('Engine')) return <Thermometer className="w-4 h-4" />;
    if (name.includes('Hydraulic')) return <Droplets className="w-4 h-4" />;
    if (name.includes('DC')) return <Battery className="w-4 h-4" />;
    if (name.includes('Fuel')) return <Gauge className="w-4 h-4" />;
    return <Plane className="w-4 h-4" />;
  };

  return (
    <Card className="bg-background/50 hud-border">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-headline uppercase tracking-wider">AeroStream Digital Twin Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subsystems.map((system) => (
          <div key={system.id} className="p-4 bg-secondary/50 rounded-md border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {getIcon(system.name)}
                <span className="text-[10px] uppercase font-bold tracking-tight">{system.name}</span>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                system.health === 'Nominal' ? "bg-accent shadow-[0_0_8px_#59F2F2]" : "bg-destructive shadow-[0_0_8px_#ef4444]"
              )} />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-headline font-bold">{system.value}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{system.unit}</span>
            </div>
            <Progress value={system.value % 100} className="h-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

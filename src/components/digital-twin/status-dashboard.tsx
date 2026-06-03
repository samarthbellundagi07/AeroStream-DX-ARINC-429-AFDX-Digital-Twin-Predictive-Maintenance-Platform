"use client";

import { SubsystemStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plane, Thermometer, Battery, Droplets, Gauge, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusDashboardProps {
  subsystems: SubsystemStatus[];
}

export function StatusDashboard({ subsystems }: StatusDashboardProps) {
  const getIcon = (name: string) => {
    if (name.includes('Engine')) return <Thermometer className="w-5 h-5" />;
    if (name.includes('Hydraulic')) return <Droplets className="w-5 h-5" />;
    if (name.includes('DC')) return <Battery className="w-5 h-5" />;
    if (name.includes('Fuel')) return <Gauge className="w-5 h-5" />;
    return <Plane className="w-5 h-5" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpRight className="w-3 h-3 text-accent" />;
    if (trend === 'down') return <ArrowDownRight className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground opacity-50" />;
  };

  return (
    <Card className="bg-card/10 hud-border border-primary/10 overflow-hidden">
      <CardHeader className="py-4 border-b border-border/30 bg-primary/5">
        <div className="flex items-center gap-3">
          <Plane className="w-6 h-6 text-primary" />
          <CardTitle className="text-sm font-headline uppercase tracking-[0.3em]">AeroStream Digital Twin Telemetry</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
        {subsystems.map((system) => (
          <div key={system.id} className="p-6 bg-secondary/20 rounded-2xl border border-border/30 hover:border-primary/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-primary group-hover:scale-110 transition-transform">
                <div className="p-2 bg-primary/10 rounded-xl">
                  {getIcon(system.name)}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors">{system.name}</span>
              </div>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                system.health === 'Nominal' ? "bg-accent shadow-[0_0_12px_rgba(89,242,242,0.6)]" : "bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.6)]"
              )} />
            </div>
            <div className="flex items-baseline justify-between mb-4">
               <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-headline font-bold tracking-tighter">{system.value.toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold opacity-60">{system.unit}</span>
               </div>
               {getTrendIcon(system.trend)}
            </div>
            <div className="space-y-1.5">
               <Progress value={system.value % 100} className="h-1.5 bg-background/50" />
               <div className="flex justify-between text-[8px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">
                  <span>Min Spec</span>
                  <span>Optimal</span>
               </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

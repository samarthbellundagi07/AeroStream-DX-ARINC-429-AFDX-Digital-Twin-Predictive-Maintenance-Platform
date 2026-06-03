"use client";

import { Defect, SubsystemStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, ShieldAlert, CheckCircle2, History, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceConsoleProps {
  defects: Defect[];
  subsystems: SubsystemStatus[];
}

export function MaintenanceConsole({ defects, subsystems }: MaintenanceConsoleProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Active Defects Panel */}
      <Card className="lg:col-span-8 bg-card/20 hud-border border-primary/10">
        <CardHeader className="border-b border-border/30 bg-primary/5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <CardTitle className="text-sm font-headline uppercase tracking-widest">Active Maintenance Defects</CardTitle>
            </div>
            <Badge variant="destructive" className="animate-pulse">{defects.length} ACTIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {defects.map((defect) => (
              <div key={defect.id} className="p-6 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <span className="font-code text-xs text-muted-foreground">{defect.id}</span>
                    <h4 className="font-headline font-bold text-lg">{defect.description}</h4>
                  </div>
                  <Badge variant={defect.severity === 'Critical' ? 'destructive' : 'outline'} className={cn(
                    "text-[10px] tracking-tighter",
                    defect.severity === 'High' && "border-orange-500 text-orange-500",
                    defect.severity === 'Medium' && "border-yellow-500 text-yellow-500"
                  )}>
                    {defect.severity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(defect.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-primary">
                    <Wrench className="w-3 h-3" />
                    {defect.subsystem}
                  </div>
                  <Badge variant="secondary" className="text-[9px] py-0">{defect.status}</Badge>
                </div>

                {defect.recommendation && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-muted-foreground italic">
                      <span className="font-bold text-primary not-italic">Recommended Action: </span>
                      {defect.recommendation}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-xs gap-2 text-primary">
                    Open Engineering Log <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Health Sidebar */}
      <Card className="lg:col-span-4 bg-card/20 hud-border border-accent/10">
        <CardHeader className="border-b border-border/30 bg-accent/5 py-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-accent" />
            <CardTitle className="text-sm font-headline uppercase tracking-widest">Remaining Useful Life (RUL)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {subsystems.map((system) => (
            <div key={system.id} className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{system.name}</span>
                <span className={cn(
                  "font-code text-sm font-bold",
                  system.remainingUsefulLife < 1000 ? "text-destructive" : "text-accent"
                )}>
                  {system.remainingUsefulLife} FH
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    system.remainingUsefulLife < 1000 ? "bg-destructive" : "bg-accent"
                  )}
                  style={{ width: `${Math.min(100, (system.remainingUsefulLife / 5000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Next Service: {system.nextMaintenanceDate}</span>
                <span className={cn(
                  "font-bold",
                  system.riskScore > 20 ? "text-destructive" : "text-accent/60"
                )}>Risk: {system.riskScore}%</span>
              </div>
            </div>
          ))}

          <div className="pt-4 mt-6 border-t border-border/20">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <h5 className="text-[11px] font-bold text-yellow-500 uppercase mb-1">Predictive Warning</h5>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Hydraulic System A is showing early signs of pump cavitation. RUL has dropped by 15% in the last 48 flight hours.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

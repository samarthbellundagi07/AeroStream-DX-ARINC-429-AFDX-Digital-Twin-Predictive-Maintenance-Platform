"use client";

import { Defect, SubsystemStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, ShieldAlert, CheckCircle2, History, Clock, AlertTriangle, ArrowRight, ListChecks } from "lucide-react";
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
              <CardTitle className="text-sm font-headline uppercase tracking-widest">Master Warning & Caution Log</CardTitle>
            </div>
            <Badge variant="destructive" className="animate-pulse">{defects.length} ACTIVE DEFECTS</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {defects.map((defect) => (
              <div key={defect.id} className="p-8 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-code text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">{defect.id}</span>
                      <h4 className="font-headline font-bold text-xl">{defect.description}</h4>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] text-muted-foreground pt-1">
                      <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(defect.timestamp).toLocaleString()}</div>
                      <div className="flex items-center gap-2 text-primary font-bold"><Wrench className="w-3 h-3" /> {defect.subsystem.toUpperCase()}</div>
                    </div>
                  </div>
                  <Badge variant={defect.severity === 'Critical' ? 'destructive' : 'outline'} className={cn(
                    "text-[10px] tracking-tighter uppercase px-4 py-1",
                    defect.severity === 'High' && "border-orange-500 text-orange-500",
                    defect.severity === 'Medium' && "border-yellow-500 text-yellow-500"
                  )}>
                    {defect.severity}
                  </Badge>
                </div>

                {defect.recommendation && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Recommended Action</span>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">{defect.recommendation}</p>
                      </div>
                    </div>
                    
                    {defect.isolationSteps && (
                      <div className="pl-9 space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <ListChecks className="w-3 h-3" /> Fault Isolation Manual (FIM) Steps:
                        </span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4">
                          {defect.isolationSteps.map((step, idx) => (
                            <li key={idx} className="text-[11px] text-muted-foreground/80">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-xs gap-2 text-primary hover:bg-primary/10">
                    Open Integrated Maintenance Log <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {defects.length === 0 && (
              <div className="p-20 text-center space-y-4 opacity-40">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
                <p className="font-headline uppercase tracking-widest text-sm font-bold">No active defects recorded for current mission profile</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Health & Predictive RUL */}
      <Card className="lg:col-span-4 bg-card/20 hud-border border-accent/10 h-fit">
        <CardHeader className="border-b border-border/30 bg-accent/5 py-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-accent" />
            <CardTitle className="text-sm font-headline uppercase tracking-widest">Remaining Useful Life (RUL)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {subsystems.map((system) => (
            <div key={system.id} className="space-y-3">
              <div className="flex justify-between items-baseline">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{system.name}</span>
                  <span className="text-[9px] text-muted-foreground/60">Risk Profile: {system.riskScore}%</span>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "font-code text-base font-bold",
                    system.remainingUsefulLife < 200 ? "text-destructive" : "text-accent"
                  )}>
                    {system.remainingUsefulLife} FH
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    system.remainingUsefulLife < 200 ? "bg-destructive animate-pulse" : "bg-accent"
                  )}
                  style={{ width: `${Math.min(100, (system.remainingUsefulLife / 5000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold">
                <span>Next Service: {system.nextMaintenanceDate}</span>
                <span className={cn(system.failureProbability > 0.5 && "text-destructive")}>P(Fail): {(system.failureProbability * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}

          <div className="pt-6 mt-6 border-t border-border/20">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-yellow-500 uppercase">Predictive Maintenance Alert</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    Automated trend analysis suggests a high correlation between current vibration profiles and a potential actuator failure within 50 flight hours.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-[9px] h-7 uppercase font-bold border-yellow-500/30 text-yellow-500">View Correlation Matrix</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

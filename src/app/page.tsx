"use client";

import { useState, useEffect, useCallback } from "react";
import { BusSimulator } from "@/lib/bus-simulator";
import { Arinc429Word, AfdxFrame, SubsystemStatus, BusMetrics } from "@/lib/types";
import { TelemetryStream } from "@/components/bus/telemetry-stream";
import { FaultInjector } from "@/components/bus/fault-injector";
import { PerformanceOscilloscope } from "@/components/bus/performance-oscilloscope";
import { StatusDashboard } from "@/components/digital-twin/status-dashboard";
import { MaintenanceTool } from "@/components/ai/maintenance-tool";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, FileText, LayoutDashboard, Database, Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AeroStreamDXDashboard() {
  const [arincStream, setArincStream] = useState<Arinc429Word[]>([]);
  const [afdxStream, setAfdxStream] = useState<AfdxFrame[]>([]);
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [activeFaults, setActiveFaults] = useState<any[]>([]);
  const [view, setView] = useState<'monitor' | 'analytics' | 'reports'>('monitor');

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setArincStream(prev => [BusSimulator.generateArincWord(activeFaults), ...prev].slice(0, 50));
      setAfdxStream(prev => [BusSimulator.generateAfdxFrame(activeFaults), ...prev].slice(0, 50));
      setSubsystems(BusSimulator.getSubsystemStatus());
      
      setMetrics(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          throughput: 30 + Math.random() * 20 + (activeFaults.length * 5),
          latency: 2 + Math.random() * 2 + (activeFaults.length > 0 ? 3 : 0),
        }
      ].slice(-30));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFaults]);

  const anomalies = [
    ...arincStream.filter(w => !w.isValid),
    ...afdxStream.filter(f => !f.isValid || !f.isCompliant)
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      {/* HUD-inspired Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-lg leading-none">AEROSTREAM</h1>
            <span className="text-[10px] text-accent font-bold tracking-[0.2em]">DX TERMINAL</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => setView('monitor')}
            className={cn("w-full justify-start gap-3 font-headline uppercase text-xs tracking-wider", view === 'monitor' && "bg-primary/10 text-primary border-r-2 border-primary")}
          >
            <LayoutDashboard className="w-4 h-4" /> Bus Monitor
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 font-headline uppercase text-xs tracking-wider opacity-60"
          >
            <Terminal className="w-4 h-4" /> Diagnostic Hub
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('analytics')}
            className={cn("w-full justify-start gap-3 font-headline uppercase text-xs tracking-wider", view === 'analytics' && "bg-primary/10 text-primary border-r-2 border-primary")}
          >
            <Activity className="w-4 h-4" /> Performance
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('reports')}
            className={cn("w-full justify-start gap-3 font-headline uppercase text-xs tracking-wider", view === 'reports' && "bg-primary/10 text-primary border-r-2 border-primary")}
          >
            <FileText className="w-4 h-4" /> Mission Reports
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 font-headline uppercase text-xs tracking-wider opacity-60"
          >
            <Database className="w-4 h-4" /> Data Archival
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50 space-y-4">
          <div className="px-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">System Health</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-accent">ONLINE</span>
              <span className="font-mono text-[10px]">99.8% UPTIME</span>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 text-xs uppercase font-headline">
            <Settings className="w-3 h-3" /> Preferences
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar with quick metrics */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/20 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active Stream</span>
              <span className="font-headline text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> AFDX-SIM-01
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Throughput</span>
              <span className="font-headline text-sm font-bold">{metrics[metrics.length-1]?.throughput?.toFixed(1) || 0} Mbps</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Latency</span>
              <span className="font-headline text-sm font-bold text-accent">{metrics[metrics.length-1]?.latency?.toFixed(2) || 0} ms</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Maintenance Tech</div>
              <div className="text-xs font-bold font-headline">COMMANDER DX</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
               <span className="font-headline font-bold text-primary">DX</span>
             </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {view === 'monitor' && (
            <>
              <StatusDashboard subsystems={subsystems} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="arinc" className="w-full">
                    <TabsList className="bg-secondary/50 border border-border p-1">
                      <TabsTrigger value="arinc" className="font-headline uppercase text-[10px] tracking-widest data-[state=active]:bg-primary">ARINC 429</TabsTrigger>
                      <TabsTrigger value="afdx" className="font-headline uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-black">AFDX (ARINC 664)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="arinc" className="h-[400px] mt-2">
                      <TelemetryStream type="ARINC" arincWords={arincStream} afdxFrames={[]} />
                    </TabsContent>
                    <TabsContent value="afdx" className="h-[400px] mt-2">
                      <TelemetryStream type="AFDX" arincWords={[]} afdxFrames={afdxStream} />
                    </TabsContent>
                  </Tabs>
                  
                  <FaultInjector onFaultChange={setActiveFaults} />
                </div>
                
                <div className="space-y-6">
                  <MaintenanceTool currentAnomalies={anomalies} />
                  
                  <Card className="bg-background/50 hud-border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground">Bus Performance Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-muted-foreground">Utilization</span>
                        <span className="font-headline font-bold">{activeFaults.length * 4 + 12}%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-muted-foreground">Error Rate</span>
                        <span className="font-headline font-bold text-destructive">{(anomalies.length / (arincStream.length + afdxStream.length) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-muted-foreground">Packets/Sec</span>
                        <span className="font-headline font-bold">120 PKT/S</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {view === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" /> Performance Oscilloscope
              </h2>
              <PerformanceOscilloscope data={metrics} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-background/50 hud-border p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Total Packets Processed</span>
                  <span className="text-4xl font-headline font-bold">2,410,294</span>
                  <span className="text-[10px] text-accent mt-2">+1,204 SINCE BOOT</span>
                </Card>
                <Card className="bg-background/50 hud-border p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground mb-2">System Jitter (Avg)</span>
                  <span className="text-4xl font-headline font-bold">0.04ms</span>
                  <span className="text-[10px] text-accent mt-2">WITHIN SPECIFICATION</span>
                </Card>
                <Card className="bg-background/50 hud-border p-6 flex flex-col items-center justify-center text-center border-destructive/20">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Critical Faults</span>
                  <span className="text-4xl font-headline font-bold text-destructive">{anomalies.length}</span>
                  <span className="text-[10px] text-destructive mt-2">REQUIRES ATTENTION</span>
                </Card>
              </div>
            </div>
          )}

          {view === 'reports' && (
            <div className="space-y-6">
               <h2 className="text-2xl font-headline font-bold uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" /> Mission Diagnostic Reports
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/50 hud-border overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-headline font-bold text-lg mb-2">GENERATE RECENT LOG</h3>
                    <p className="text-sm text-muted-foreground mb-6">Create a comprehensive PDF report including bit-level analysis of the last 10,000 words.</p>
                    <div className="space-y-3">
                      <Button className="w-full justify-start gap-3 bg-secondary hover:bg-secondary/80 border border-border">
                        <FileText className="w-4 h-4 text-primary" /> Export as PDF (Aerospace Std)
                      </Button>
                      <Button className="w-full justify-start gap-3 bg-secondary hover:bg-secondary/80 border border-border">
                        <Database className="w-4 h-4 text-accent" /> Export RAW Data (CSV)
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

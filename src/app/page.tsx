"use client";

import { useState, useEffect, useMemo } from "react";
import { BusSimulator } from "@/lib/bus-simulator";
import { Arinc429Word, AfdxFrame, SubsystemStatus, BusMetrics, FaultConfig } from "@/lib/types";
import { TelemetryStream } from "@/components/bus/telemetry-stream";
import { FaultInjector } from "@/components/bus/fault-injector";
import { PerformanceOscilloscope } from "@/components/bus/performance-oscilloscope";
import { StatusDashboard } from "@/components/digital-twin/status-dashboard";
import { MaintenanceTool } from "@/components/ai/maintenance-tool";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, FileText, LayoutDashboard, Database, Activity, Terminal, ShieldAlert, Zap, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AeroStreamDXDashboard() {
  const [arincStream, setArincStream] = useState<Arinc429Word[]>([]);
  const [afdxStream, setAfdxStream] = useState<AfdxFrame[]>([]);
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<BusMetrics[]>([]);
  const [activeFaults, setActiveFaults] = useState<FaultConfig[]>([]);
  const [view, setView] = useState<'monitor' | 'analytics' | 'reports'>('monitor');

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const newArinc = BusSimulator.generateArincWord(activeFaults);
      const newAfdx = BusSimulator.generateAfdxFrame(activeFaults);
      
      setArincStream(prev => [newArinc, ...prev].slice(0, 100));
      setAfdxStream(prev => [newAfdx, ...prev].slice(0, 100));
      setSubsystems(BusSimulator.getSubsystemStatus());
      
      const lastMetrics = metricsHistory[metricsHistory.length - 1];
      const faultImpact = activeFaults.filter(f => f.active).length;
      
      const newMetrics: BusMetrics = {
        timestamp: new Date().toLocaleTimeString(),
        throughput: 45 + Math.random() * 10 + (faultImpact * 8),
        latency: 1.5 + Math.random() * 0.5 + (faultImpact > 0 ? 2 : 0),
        packetRate: 120 + Math.random() * 20,
        utilization: 15 + (faultImpact * 5) + (Math.random() * 2),
        errorRate: (faultImpact * 4.5) + (Math.random() * 0.5),
        arincRate: 60 + Math.random() * 10,
        afdxRate: 40 + Math.random() * 5
      };

      setMetricsHistory(prev => [...prev, newMetrics].slice(-50));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFaults, metricsHistory]);

  const anomalies = useMemo(() => [
    ...arincStream.filter(w => !w.isValid),
    ...afdxStream.filter(f => !f.isValid || !f.isCompliant)
  ], [arincStream, afdxStream]);

  const currentMetrics = metricsHistory[metricsHistory.length - 1] || {
    throughput: 0, latency: 0, packetRate: 0, utilization: 0, errorRate: 0, arincRate: 0, afdxRate: 0
  };

  const systemStatus = currentMetrics.errorRate > 10 ? 'Critical' : currentMetrics.errorRate > 5 ? 'Warning' : 'Normal';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body selection:bg-primary/20">
      {/* HUD Sidebar */}
      <aside className="w-72 border-r border-border/50 bg-card/20 flex flex-col p-5 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(48,148,232,0.2)]">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl tracking-tight leading-none">AEROSTREAM</h1>
            <span className="text-[10px] text-accent font-bold tracking-[0.3em] opacity-80 uppercase">DX Operations</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <SidebarItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Bus Monitor" 
            active={view === 'monitor'} 
            onClick={() => setView('monitor')} 
          />
          <SidebarItem 
            icon={<Terminal className="w-4 h-4" />} 
            label="Diagnostic Hub" 
            active={false}
            disabled
          />
          <SidebarItem 
            icon={<BarChart3 className="w-4 h-4" />} 
            label="Performance" 
            active={view === 'analytics'} 
            onClick={() => setView('analytics')} 
          />
          <SidebarItem 
            icon={<FileText className="w-4 h-4" />} 
            label="Mission Reports" 
            active={view === 'reports'} 
            onClick={() => setView('reports')} 
          />
          <SidebarItem 
            icon={<Database className="w-4 h-4" />} 
            label="Black Box Data" 
            active={false}
            disabled
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-border/30 space-y-5">
          <div className="px-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">System Health</span>
              <Badge variant={systemStatus === 'Normal' ? 'outline' : 'destructive'} className={cn("text-[9px] py-0", systemStatus === 'Normal' && "text-accent border-accent/30")}>
                {systemStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", systemStatus === 'Normal' ? "bg-accent" : systemStatus === 'Warning' ? "bg-yellow-500" : "bg-destructive")} 
                style={{ width: `${100 - currentMetrics.errorRate}%` }} 
              />
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 text-xs uppercase font-headline border-primary/20 hover:border-primary/50 bg-primary/5">
            <Settings className="w-3 h-3" /> System Config
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Metrics */}
        <header className="h-20 border-b border-border/40 flex items-center justify-between px-8 bg-card/10 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-10">
            <HeaderMetric label="ARINC Rate" value={`${currentMetrics.arincRate.toFixed(1)} w/s`} icon={<Clock className="w-3 h-3 text-primary" />} />
            <HeaderMetric label="AFDX Rate" value={`${currentMetrics.afdxRate.toFixed(1)} f/s`} icon={<Zap className="w-3 h-3 text-accent" />} />
            <HeaderMetric label="Bus Load" value={`${currentMetrics.utilization.toFixed(1)}%`} progress={currentMetrics.utilization} />
            <HeaderMetric label="Anomalies" value={anomalies.length} color={anomalies.length > 0 ? "text-destructive" : "text-accent"} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Maintenance Rank</div>
              <div className="text-xs font-bold font-headline text-primary">CHIEF ENGINEER</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-headline font-bold text-primary relative z-10">DX</span>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 terminal-scroll">
          {view === 'monitor' && (
            <>
              <StatusDashboard subsystems={subsystems} />
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                  <Tabs defaultValue="arinc" className="w-full">
                    <TabsList className="bg-secondary/20 border border-border/30 p-1 mb-4">
                      <TabsTrigger value="arinc" className="font-headline uppercase text-[11px] tracking-widest data-[state=active]:bg-primary px-6">ARINC 429 MONITOR</TabsTrigger>
                      <TabsTrigger value="afdx" className="font-headline uppercase text-[11px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-black px-6">AFDX DATA BUS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="arinc" className="h-[450px] outline-none">
                      <TelemetryStream type="ARINC" arincWords={arincStream} afdxFrames={[]} />
                    </TabsContent>
                    <TabsContent value="afdx" className="h-[450px] outline-none">
                      <TelemetryStream type="AFDX" arincWords={[]} afdxFrames={afdxStream} />
                    </TabsContent>
                  </Tabs>
                  
                  <FaultInjector onFaultChange={setActiveFaults} />
                </div>
                
                <div className="xl:col-span-4 space-y-8">
                  <MaintenanceTool currentAnomalies={anomalies} />
                  
                  <Card className="bg-card/20 hud-border border-primary/10 overflow-hidden">
                    <CardHeader className="py-4 border-b border-border/30 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-headline uppercase tracking-[0.2em]">Real-time Statistics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <StatRow label="Network Utilization" value={`${currentMetrics.utilization.toFixed(1)}%`} subValue="Avg: 14.2%" />
                      <StatRow label="Bit Error Rate (BER)" value={`${(currentMetrics.errorRate / 100).toFixed(4)}`} subValue="Target: < 0.001" alert={currentMetrics.errorRate > 5} />
                      <StatRow label="Mean Packet Jitter" value="0.04ms" subValue="Max: 0.12ms" />
                      <StatRow label="Frames Processed" value="2.4M" subValue="+1.2k/s" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {view === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary" /> Performance Oscilloscope
                </h2>
                <div className="flex gap-3">
                   <Button variant="outline" className="text-xs font-headline uppercase border-primary/30">Last 24 Hours</Button>
                   <Button variant="outline" className="text-xs font-headline uppercase border-primary/30">Download Data</Button>
                </div>
              </div>
              <PerformanceOscilloscope data={metricsHistory} />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <AnalyticsCard label="ARINC THROUGHPUT" value={`${currentMetrics.throughput.toFixed(1)} Mbps`} trend="+12%" />
                 <AnalyticsCard label="SYSTEM LATENCY" value={`${currentMetrics.latency.toFixed(2)} ms`} trend="-2%" neutral />
                 <AnalyticsCard label="BUS CONGESTION" value={`${currentMetrics.utilization.toFixed(1)}%`} trend="+5%" alert={currentMetrics.utilization > 30} />
                 <AnalyticsCard label="ACTIVE FAULTS" value={activeFaults.filter(f => f.active).length} trend={activeFaults.length > 0 ? "WARNING" : "NOMINAL"} alert={activeFaults.length > 0} />
              </div>
            </div>
          )}

          {view === 'reports' && (
            <div className="space-y-8">
               <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" /> Mission Diagnostic Reports
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/20 hud-border overflow-hidden border-primary/10">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-5 h-5 text-primary" /></div>
                      <h3 className="font-headline font-bold text-xl uppercase tracking-wider">Mission Summary Report</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Generate a comprehensive engineering report including bit-level analysis of the last 100,000 ARINC words 
                      and AFDX frames, cross-referenced with simulated digital twin health degradation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button className="w-full justify-start gap-3 bg-primary hover:bg-primary/80 font-headline uppercase text-[10px] tracking-widest py-6">
                        <FileText className="w-4 h-4" /> Export Aerospace PDF
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-3 bg-secondary/30 border-border/50 font-headline uppercase text-[10px] tracking-widest py-6">
                        <Database className="w-4 h-4 text-accent" /> Raw Data (JSON/CSV)
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/20 hud-border overflow-hidden border-destructive/10">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-destructive/10 rounded-lg"><ShieldAlert className="w-5 h-5 text-destructive" /></div>
                      <h3 className="font-headline font-bold text-xl uppercase tracking-wider">Failure Analysis log</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Detailed chronological log of all injected faults and detected anomalies, including root cause 
                      assessment provided by the AeroStream AI Engine.
                    </p>
                    <Button variant="outline" className="w-full justify-center gap-3 border-destructive/30 hover:bg-destructive/10 text-destructive font-headline uppercase text-[10px] tracking-widest py-6">
                      <Activity className="w-4 h-4" /> Archive Failure Report
                    </Button>
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

function SidebarItem({ icon, label, active, onClick, disabled = false }: { icon: any, label: string, active: boolean, onClick?: () => void, disabled?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start gap-3 font-headline uppercase text-[11px] tracking-[0.15em] transition-all duration-300 py-6 h-auto",
        active 
          ? "bg-primary/10 text-primary border-r-2 border-primary shadow-[inset_-5px_0_15px_-5px_rgba(48,148,232,0.3)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
      {label}
    </Button>
  );
}

function HeaderMetric({ label, value, icon, color = "text-foreground", progress }: { label: string, value: string | number, icon?: any, color?: string, progress?: number }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[100px]">
      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {icon && icon}
        <span className={cn("font-headline text-sm font-bold", color)}>{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, subValue, alert = false }: { label: string, value: string, subValue: string, alert?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</span>
        <span className={cn("font-headline font-bold text-sm", alert ? "text-destructive" : "text-primary")}>{value}</span>
      </div>
      <span className="text-[9px] text-muted-foreground opacity-60 text-right">{subValue}</span>
      <div className="h-[1px] w-full bg-border/20 mt-1" />
    </div>
  );
}

function AnalyticsCard({ label, value, trend, neutral = false, alert = false }: { label: string, value: string | number, trend: string, neutral?: boolean, alert?: boolean }) {
  return (
    <Card className={cn("bg-card/20 hud-border p-6 flex flex-col items-center justify-center text-center border-primary/10 transition-transform hover:scale-[1.02]", alert && "border-destructive/30")}>
      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3 opacity-70">{label}</span>
      <span className={cn("text-4xl font-headline font-bold", alert ? "text-destructive" : "text-foreground")}>{value}</span>
      <Badge variant="outline" className={cn("mt-4 text-[9px] py-0 tracking-widest border-border/50", neutral ? "text-muted-foreground" : alert ? "text-destructive border-destructive/20" : "text-accent border-accent/20")}>
        {trend}
      </Badge>
    </Card>
  );
}

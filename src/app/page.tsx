"use client";

import { useState, useEffect, useMemo } from "react";
import { BusSimulator } from "@/lib/bus-simulator";
import { Arinc429Word, AfdxFrame, SubsystemStatus, BusMetrics, FaultConfig, Defect } from "@/lib/types";
import { TelemetryStream } from "@/components/bus/telemetry-stream";
import { FaultInjector } from "@/components/bus/fault-injector";
import { PerformanceOscilloscope } from "@/components/bus/performance-oscilloscope";
import { StatusDashboard } from "@/components/digital-twin/status-dashboard";
import { MaintenanceTool } from "@/components/ai/maintenance-tool";
import { MaintenanceConsole } from "@/components/maintenance/console";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Terminal, 
  BarChart3, 
  FileText, 
  Database, 
  Settings, 
  Activity, 
  Clock, 
  Zap, 
  ShieldAlert,
  Wrench,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AeroStreamDXDashboard() {
  const [arincStream, setArincStream] = useState<Arinc429Word[]>([]);
  const [afdxStream, setAfdxStream] = useState<AfdxFrame[]>([]);
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<BusMetrics[]>([]);
  const [activeFaults, setActiveFaults] = useState<FaultConfig[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [view, setView] = useState<'monitor' | 'maintenance' | 'analytics' | 'reports'>('monitor');

  // Unified Simulation Stream
  useEffect(() => {
    const interval = setInterval(() => {
      const newArinc = BusSimulator.generateArincWord(activeFaults);
      const newAfdx = BusSimulator.generateAfdxFrame(activeFaults);
      
      setArincStream(prev => [newArinc, ...prev].slice(0, 100));
      setAfdxStream(prev => [newAfdx, ...prev].slice(0, 100));
      setSubsystems(BusSimulator.getSubsystemStatus());
      setDefects(BusSimulator.getDefectHistory());
      
      const faultImpact = activeFaults.filter(f => f.active).length;
      const anomalies = [newArinc, newAfdx].filter(x => !x.isValid).length;
      
      const newMetrics: BusMetrics = {
        timestamp: new Date().toLocaleTimeString(),
        throughput: 42 + Math.random() * 8 + (faultImpact * 5),
        latency: 1.2 + Math.random() * 0.4 + (faultImpact > 0 ? 1 : 0),
        packetRate: 150 + Math.random() * 30,
        utilization: 12 + (faultImpact * 4) + (Math.random() * 2),
        errorRate: (faultImpact * 3.5) + (Math.random() * 0.5),
        arincRate: 85 + Math.random() * 15,
        afdxRate: 55 + Math.random() * 10,
        anomalyCount: anomalies
      };

      setMetricsHistory(prev => [...prev, newMetrics].slice(-50));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFaults]);

  const currentMetrics = metricsHistory[metricsHistory.length - 1] || {
    throughput: 0, latency: 0, packetRate: 0, utilization: 0, errorRate: 0, arincRate: 0, afdxRate: 0, anomalyCount: 0
  };

  const systemStatus = currentMetrics.errorRate > 8 ? 'Critical' : currentMetrics.errorRate > 3 ? 'Warning' : 'Normal';

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
            label="Real-Time Monitor" 
            active={view === 'monitor'} 
            onClick={() => setView('monitor')} 
          />
          <SidebarItem 
            icon={<Wrench className="w-4 h-4" />} 
            label="Maintenance Console" 
            active={view === 'maintenance'} 
            onClick={() => setView('maintenance')} 
          />
          <SidebarItem 
            icon={<BarChart3 className="w-4 h-4" />} 
            label="System Analytics" 
            active={view === 'analytics'} 
            onClick={() => setView('analytics')} 
          />
          <SidebarItem 
            icon={<FileText className="w-4 h-4" />} 
            label="Diagnostic Reports" 
            active={view === 'reports'} 
            onClick={() => setView('reports')} 
          />
          <SidebarItem 
            icon={<Database className="w-4 h-4" />} 
            label="Telemetry History" 
            active={false}
            disabled
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-border/30 space-y-5">
          <div className="px-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Health</span>
              <Badge variant={systemStatus === 'Normal' ? 'outline' : 'destructive'} className={cn("text-[9px] py-0", systemStatus === 'Normal' && "text-accent border-accent/30")}>
                {systemStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", systemStatus === 'Normal' ? "bg-accent" : systemStatus === 'Warning' ? "bg-yellow-500" : "bg-destructive")} 
                style={{ width: `${100 - currentMetrics.errorRate * 5}%` }} 
              />
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 text-xs uppercase font-headline border-primary/20 hover:border-primary/50 bg-primary/5">
            <Settings className="w-3 h-3" /> Preferences
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Operations Header */}
        <header className="h-20 border-b border-border/40 flex items-center justify-between px-8 bg-card/10 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-10">
            <HeaderMetric label="ARINC 429 Stream" value={`${currentMetrics.arincRate.toFixed(1)} w/s`} icon={<Clock className="w-3 h-3 text-primary" />} />
            <HeaderMetric label="AFDX 664 Stream" value={`${currentMetrics.afdxRate.toFixed(1)} f/s`} icon={<Zap className="w-3 h-3 text-accent" />} />
            <HeaderMetric label="Bus Utilization" value={`${currentMetrics.utilization.toFixed(1)}%`} progress={currentMetrics.utilization} />
            <HeaderMetric label="Live Anomalies" value={currentMetrics.anomalyCount} color={currentMetrics.anomalyCount > 0 ? "text-destructive" : "text-accent"} />
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Maximize2 className="w-4 h-4" /></Button>
            <div className="w-[1px] h-8 bg-border/40 mx-2" />
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Maintenance Mode</div>
              <div className="text-xs font-bold font-headline text-primary">FULL ENGINEERING ACCESS</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-headline font-bold text-primary">
              DX
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 terminal-scroll">
          {view === 'monitor' && (
            <>
              <StatusDashboard subsystems={subsystems} />
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                  <Tabs defaultValue="arinc" className="w-full">
                    <TabsList className="bg-secondary/20 border border-border/30 p-1 mb-4">
                      <TabsTrigger value="arinc" className="font-headline uppercase text-[11px] tracking-widest px-6">ARINC 429 PROTOCOL ENGINE</TabsTrigger>
                      <TabsTrigger value="afdx" className="font-headline uppercase text-[11px] tracking-widest px-6">AFDX 664 VIRTUAL LINKS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="arinc" className="h-[480px] outline-none">
                      <TelemetryStream type="ARINC" arincWords={arincStream} afdxFrames={[]} />
                    </TabsContent>
                    <TabsContent value="afdx" className="h-[480px] outline-none">
                      <TelemetryStream type="AFDX" arincWords={[]} afdxFrames={afdxStream} />
                    </TabsContent>
                  </Tabs>
                  
                  <FaultInjector onFaultChange={setActiveFaults} />
                </div>
                
                <div className="xl:col-span-4 space-y-8">
                  <MaintenanceTool currentAnomalies={[...arincStream, ...afdxStream].filter(x => !x.isValid)} />
                  
                  <Card className="bg-card/20 hud-border border-primary/10">
                    <CardHeader className="py-4 border-b border-border/30 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-headline uppercase tracking-widest">Diagnostic Summary</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <StatRow label="Bit Error Rate" value={(currentMetrics.errorRate / 1000).toFixed(6)} subValue="Goal: < 1E-9" />
                      <StatRow label="BAG Compliance" value="99.8%" subValue="Jitter Max: 0.12ms" />
                      <StatRow label="Label Density" value="6 Active" subValue="Max: 256/bus" />
                      <StatRow label="System Latency" value={`${currentMetrics.latency.toFixed(2)}ms`} subValue="Avg: 1.25ms" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {view === 'maintenance' && (
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center gap-4">
                  <Wrench className="w-10 h-10 text-primary" /> Aircraft Maintenance Console
                </h2>
                <div className="flex gap-4">
                  <Button variant="outline" className="font-headline uppercase text-xs">Clear Master Warning</Button>
                  <Button className="bg-primary hover:bg-primary/80 font-headline uppercase text-xs">Acknowledge All</Button>
                </div>
              </div>
              <MaintenanceConsole defects={defects} subsystems={subsystems} />
            </div>
          )}

          {view === 'analytics' && (
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center gap-4">
                  <Activity className="w-10 h-10 text-primary" /> Performance Analysis
                </h2>
              </div>
              <PerformanceOscilloscope data={metricsHistory} />
            </div>
          )}

          {view === 'reports' && (
            <div className="max-w-4xl mx-auto space-y-12 py-10">
              <div className="text-center space-y-4">
                <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-headline font-bold uppercase tracking-tighter">Mission Diagnostic Reports</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Generate aerospace-compliant documentation for aircraft maintenance logs and engineering review.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard 
                  title="Full Mission Analysis" 
                  desc="Detailed bit-level log of all ARINC 429 and AFDX frames processed during the current session." 
                  icon={<Database className="w-6 h-6 text-primary" />}
                />
                <ReportCard 
                  title="Failure Analysis Log" 
                  desc="Focuses on parity errors, CRC violations, and BAG compliance failures detected by AI." 
                  icon={<ShieldAlert className="w-6 h-6 text-destructive" />}
                  variant="destructive"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, disabled = false }: any) {
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

function HeaderMetric({ label, value, icon, color = "text-foreground", progress }: any) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
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

function StatRow({ label, value, subValue }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] text-muted-foreground uppercase font-bold">{label}</span>
        <span className="font-headline font-bold text-sm text-primary">{value}</span>
      </div>
      <span className="text-[9px] text-muted-foreground opacity-60 text-right">{subValue}</span>
      <div className="h-[1px] w-full bg-border/20 mt-1" />
    </div>
  );
}

function ReportCard({ title, desc, icon, variant = "default" }: any) {
  return (
    <Card className={cn("bg-card/20 hud-border p-8 hover:scale-[1.02] transition-transform", variant === 'destructive' ? 'border-destructive/20' : 'border-primary/20')}>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-xl", variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10')}>{icon}</div>
        <h3 className="font-headline font-bold text-xl uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{desc}</p>
      <div className="flex gap-4">
        <Button className={cn("flex-1 font-headline text-[10px] tracking-widest uppercase py-6", variant === 'destructive' ? 'bg-destructive' : 'bg-primary')}>Export PDF</Button>
        <Button variant="outline" className="flex-1 font-headline text-[10px] tracking-widest uppercase py-6">CSV / Excel</Button>
      </div>
    </Card>
  );
}

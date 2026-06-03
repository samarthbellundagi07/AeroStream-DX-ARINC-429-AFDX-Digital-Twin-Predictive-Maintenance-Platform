"use client";

import { useState, useEffect, useMemo } from "react";
import { BusSimulator } from "@/lib/bus-simulator";
import { Arinc429Word, AfdxFrame, SubsystemStatus, BusMetrics, FaultConfig, Defect, FlightScenario } from "@/lib/types";
import { TelemetryStream } from "@/components/bus/telemetry-stream";
import { FaultInjector } from "@/components/bus/fault-injector";
import { PerformanceOscilloscope } from "@/components/bus/performance-oscilloscope";
import { StatusDashboard } from "@/components/digital-twin/status-dashboard";
import { MaintenanceTool } from "@/components/ai/maintenance-tool";
import { MaintenanceConsole } from "@/components/maintenance/console";
import { ReportGenerator } from "@/components/ai/report-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Wrench, 
  Plane, 
  PlayCircle 
} from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

export default function AeroStreamDXDashboard() {
  const [arincStream, setArincStream] = useState<Arinc429Word[]>([]);
  const [afdxStream, setAfdxStream] = useState<AfdxFrame[]>([]);
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<BusMetrics[]>([]);
  const [activeFaults, setActiveFaults] = useState<FaultConfig[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [view, setView] = useState<'monitor' | 'maintenance' | 'analytics' | 'reports' | 'scenario'>('monitor');
  const [currentScenario, setCurrentScenario] = useState<FlightScenario>('NORMAL');

  // Primary Simulation Loop (1Hz Update Frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      const newArinc = BusSimulator.generateArincWord(activeFaults);
      const newAfdx = BusSimulator.generateAfdxFrame(activeFaults);
      
      setArincStream(prev => [newArinc, ...prev].slice(0, 50));
      setAfdxStream(prev => [newAfdx, ...prev].slice(0, 50));
      setSubsystems(BusSimulator.getSubsystemStatus());
      setDefects(BusSimulator.getDefectHistory());
      
      const faultImpact = activeFaults.filter(f => f.active).length;
      const anomalies = [newArinc, newAfdx].filter(x => !x.isValid).length;
      
      const newMetrics: BusMetrics = {
        timestamp: formatTimestamp(new Date()),
        throughput: 42 + Math.random() * 8 + (faultImpact * 5),
        latency: 1.2 + Math.random() * 0.4 + (faultImpact > 0 ? 1 : 0),
        packetRate: 150 + Math.random() * 30,
        utilization: 12 + (faultImpact * 4) + (Math.random() * 2),
        errorRate: (faultImpact * 3.5) + (Math.random() * 0.5),
        arincRate: 85 + Math.random() * 15,
        afdxRate: 55 + Math.random() * 10,
        anomalyCount: anomalies
      };

      setMetricsHistory(prev => [...prev, newMetrics].slice(-30));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFaults]);

  const changeScenario = (s: FlightScenario) => {
    BusSimulator.setScenario(s);
    setCurrentScenario(s);
  };

  const currentMetrics = useMemo(() => metricsHistory[metricsHistory.length - 1] || {
    throughput: 0, latency: 0, packetRate: 0, utilization: 0, errorRate: 0, arincRate: 0, afdxRate: 0, anomalyCount: 0
  }, [metricsHistory]);

  const systemStatus = currentMetrics.errorRate > 8 ? 'Critical' : currentMetrics.errorRate > 3 ? 'Warning' : 'Normal';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-border/50 bg-card/20 flex flex-col p-5 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(48,148,232,0.2)]">
            <Plane className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl tracking-tight leading-none text-foreground">AEROSTREAM</h1>
            <span className="text-[10px] text-accent font-bold tracking-[0.3em] opacity-80 uppercase">DX Station</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <SidebarItem icon={<LayoutDashboard className="w-4 h-4" />} label="Operations Center" active={view === 'monitor'} onClick={() => setView('monitor')} />
          <SidebarItem icon={<Wrench className="w-4 h-4" />} label="Maintenance Hub" active={view === 'maintenance'} onClick={() => setView('maintenance')} />
          <SidebarItem icon={<PlayCircle className="w-4 h-4" />} label="Scenario Control" active={view === 'scenario'} onClick={() => setView('scenario')} />
          <SidebarItem icon={<BarChart3 className="w-4 h-4" />} label="Flight Analytics" active={view === 'analytics'} onClick={() => setView('analytics')} />
          <SidebarItem icon={<FileText className="w-4 h-4" />} label="Diagnostic Logs" active={view === 'reports'} onClick={() => setView('reports')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-border/30">
          <div className="bg-secondary/20 p-4 rounded-xl space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Active Profile</span>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{currentScenario.replace('_', ' ')}</Badge>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Master Warning</span>
                <div className={cn("w-2 h-2 rounded-full", systemStatus === 'Critical' ? "bg-destructive animate-ping" : systemStatus === 'Warning' ? "bg-orange-500" : "bg-accent/40")} />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border/40 flex items-center justify-between px-8 bg-card/10 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-8">
            <MetricBox label="ARINC STREAM" value={`${currentMetrics.arincRate.toFixed(1)} w/s`} />
            <MetricBox label="AFDX VL LOAD" value={`${currentMetrics.afdxRate.toFixed(1)} f/s`} />
            <MetricBox label="BUS UTIL" value={`${currentMetrics.utilization.toFixed(1)}%`} />
            <MetricBox label="ANOMALIES" value={currentMetrics.anomalyCount} alert={currentMetrics.anomalyCount > 0} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Maintenance Privilege</div>
              <div className="text-xs font-bold text-primary font-headline tracking-widest uppercase">Full Engineering Access</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">DX</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 terminal-scroll">
          {view === 'monitor' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <StatusDashboard subsystems={subsystems} />
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                  <Tabs defaultValue="arinc">
                    <TabsList className="bg-secondary/30 border border-border/20 p-1">
                      <TabsTrigger value="arinc" className="text-[10px] font-headline uppercase tracking-widest">ARINC-429 Bus Analysis</TabsTrigger>
                      <TabsTrigger value="afdx" className="text-[10px] font-headline uppercase tracking-widest">AFDX-664 Virtual Links</TabsTrigger>
                    </TabsList>
                    <TabsContent value="arinc" className="h-[500px]">
                      <TelemetryStream type="ARINC" arincWords={arincStream} afdxFrames={[]} />
                    </TabsContent>
                    <TabsContent value="afdx" className="h-[500px]">
                      <TelemetryStream type="AFDX" arincWords={[]} afdxFrames={afdxStream} />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="xl:col-span-4 space-y-8">
                  <MaintenanceTool currentAnomalies={[...arincStream, ...afdxStream].filter(x => !x.isValid)} />
                  <FaultInjector onFaultChange={setActiveFaults} />
                </div>
              </div>
            </div>
          )}

          {view === 'maintenance' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center gap-4">
                   <Wrench className="w-10 h-10 text-primary" /> Maintenance Workstation
                 </h2>
              </div>
              <MaintenanceConsole defects={defects} subsystems={subsystems} />
            </div>
          )}

          {view === 'scenario' && (
            <div className="max-w-4xl mx-auto py-12 space-y-12">
               <div className="text-center space-y-4">
                 <PlayCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                 <h2 className="text-4xl font-headline font-bold uppercase">Scenario Simulation Controller</h2>
                 <p className="text-muted-foreground">Select a flight profile to trigger specific avionics failures and mechanical degradation.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ScenarioCard 
                  active={currentScenario === 'NORMAL'} 
                  title="Nominal Flight" 
                  desc="All systems functioning within operational envelopes. Low error rates."
                  onClick={() => changeScenario('NORMAL')}
                 />
                 <ScenarioCard 
                  active={currentScenario === 'HYDRAULIC_FAILURE'} 
                  title="Hydraulic System Leak" 
                  desc="System A pressure drop. Triggers low-pressure defects and bus alarms."
                  variant="destructive"
                  onClick={() => changeScenario('HYDRAULIC_FAILURE')}
                 />
                 <ScenarioCard 
                  active={currentScenario === 'ENGINE_OVERHEAT'} 
                  title="Engine #1 Thermal Spike" 
                  desc="EGT/N1 exceeding limits. AI identifies risk to ARINC integrity."
                  variant="destructive"
                  onClick={() => changeScenario('ENGINE_OVERHEAT')}
                 />
                 <ScenarioCard 
                  active={currentScenario === 'ELECTRICAL_BUS_FAIL'} 
                  title="Electrical EMI Interference" 
                  desc="High parity failure rate. Simulates shielding degradation."
                  variant="destructive"
                  onClick={() => changeScenario('ELECTRICAL_BUS_FAIL')}
                 />
               </div>
            </div>
          )}

          {view === 'analytics' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Signal Integrity Analytics</h2>
              <PerformanceOscilloscope data={metricsHistory} />
            </div>
          )}

          {view === 'reports' && (
            <ReportGenerator metrics={currentMetrics} subsystems={subsystems} defects={defects} />
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 font-headline uppercase text-[11px] tracking-widest py-6",
        active ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-muted-foreground hover:bg-white/5"
      )}
    >
      {icon} {label}
    </Button>
  );
}

function MetricBox({ label, value, alert }: any) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">{label}</span>
      <span className={cn("text-lg font-headline font-bold", alert ? "text-destructive" : "text-primary")}>{value}</span>
    </div>
  );
}

function ScenarioCard({ title, desc, active, variant = "default", onClick }: any) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] border-2",
        active ? (variant === 'destructive' ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5") : "border-border/30"
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl font-headline uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

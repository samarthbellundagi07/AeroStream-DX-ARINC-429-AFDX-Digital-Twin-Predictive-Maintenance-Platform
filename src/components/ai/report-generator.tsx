"use client";

import { useState } from "react";
import { generateAIDiagnosticReport, AIDiagnosticReportOutput, AIDiagnosticReportInput } from "@/ai/flows/ai-diagnostic-report-generator";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportGeneratorProps {
  metrics: any;
  subsystems: any[];
  defects: any[];
}

export function ReportGenerator({ metrics, subsystems, defects }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIDiagnosticReportOutput | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Prepare high-fidelity input data from current state
      const input: AIDiagnosticReportInput = {
        arincStatistics: {
          wordTransmissionRate: metrics.arincRate,
          labelFrequency: { "310": 12, "203": 8, "270": 4 },
          parityFailureRate: metrics.errorRate / 2,
          totalWordsProcessed: 12540,
          totalParityErrors: Math.floor(metrics.errorRate * 12)
        },
        afdxStatistics: {
          throughput: metrics.throughput,
          latency: metrics.latency,
          jitter: 0.045,
          bagCompliance: { "VL100": { compliantFrames: 998, violatedFrames: 2 } },
          virtualLinkLoad: { "VL100": 42, "VL200": 15 },
          frameDeliverySuccessRate: 99.8,
          totalFramesProcessed: 8400,
          totalCRCErrors: Math.floor(metrics.anomalyCount),
          totalSequenceErrors: 0
        },
        errorSummary: defects.map(d => d.description).join(". "),
        injectedFaults: [], // Typically passed from fault injector state if globally available
        detectedAnomalies: defects.map(d => ({
          type: d.subsystem,
          timestamp: d.timestamp,
          severityScore: d.severity === 'Critical' ? 90 : 40,
          confidenceScore: 85,
          details: d.description
        })),
        digitalTwinStatus: {
          engineHealth: subsystems.find(s => s.name.includes('Engine'))?.health || 'Nominal',
          hydraulicHealth: subsystems.find(s => s.name.includes('Hydraulic'))?.health || 'Nominal',
          electricalHealth: subsystems.find(s => s.name.includes('DC'))?.health || 'Nominal',
          fuelHealth: subsystems.find(s => s.name.includes('Fuel'))?.health || 'Nominal',
          overallSystemStatus: metrics.errorRate > 5 ? 'Warning' : 'Healthy'
        }
      };

      const result = await generateAIDiagnosticReport(input);
      setReport(result);
      toast({ title: "Report Generated", description: "AI Mission Report is ready for review." });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive", description: "Could not synthesize AI diagnostic report." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="hud-border bg-card/20 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-primary/5 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline uppercase tracking-widest">AI Mission Diagnostic Reporting</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Synthesize live bus telemetry and system health into executive intelligence.</p>
            </div>
          </div>
          <Button 
            onClick={generateReport} 
            disabled={loading}
            className="bg-primary hover:bg-primary/80 font-headline uppercase tracking-widest text-xs h-11 px-8"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            Generate AI Report
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {report ? (
            <ScrollArea className="h-[700px] p-8">
              <div className="max-w-4xl mx-auto space-y-12">
                {/* Executive Summary */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-primary/30 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-headline font-bold uppercase tracking-widest">Executive Summary</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground bg-secondary/20 p-6 rounded-2xl border border-border/30 italic">
                    "{report.executiveSummary}"
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Communication Analysis */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest">Bus Analysis</h4>
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/20 space-y-3">
                      <p className="text-[11px] leading-relaxed"><span className="text-primary font-bold">ARINC:</span> {report.communicationAnalysis.arincSummary}</p>
                      <p className="text-[11px] leading-relaxed"><span className="text-accent font-bold">AFDX:</span> {report.communicationAnalysis.afdxSummary}</p>
                    </div>
                  </div>

                  {/* Maintenance Recommendations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-accent tracking-widest">Maintenance Directives</h4>
                    <div className="bg-accent/5 p-4 rounded-xl border border-accent/20">
                      <p className="text-[11px] leading-relaxed text-accent-foreground font-medium">{report.maintenanceRecommendations}</p>
                    </div>
                  </div>
                </div>

                {/* Root Cause Assessment */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-destructive/30 pb-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h3 className="text-lg font-headline font-bold uppercase tracking-widest">Root Cause Assessment</h3>
                  </div>
                  <div className="bg-destructive/5 p-6 rounded-2xl border border-destructive/20">
                    <p className="text-sm leading-relaxed text-muted-foreground">{report.faultAnalysis.rootCauseAssessment}</p>
                  </div>
                </section>

                {/* Performance & Reliability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Reliability Assessment
                    </h5>
                    <p className="text-[11px] text-muted-foreground">{report.reliabilityAssessment}</p>
                  </div>
                  <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20 space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Performance Review
                    </h5>
                    <p className="text-[11px] text-muted-foreground">{report.performanceAnalysis.overallPerformanceAssessment}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center animate-pulse">
                <FileText className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-headline font-bold uppercase tracking-widest">No Report Generated</h3>
                <p className="text-sm text-muted-foreground">The AI engine is ready. Click the button above to synthesize mission data into a comprehensive engineering report.</p>
              </div>
            </div>
          )}
        </CardContent>

        {report && (
          <CardFooter className="border-t border-border/30 bg-primary/5 py-4 flex justify-end gap-4">
            <Button variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-widest gap-2">
              <Download className="w-3.0 h-3.0" /> Export JSON
            </Button>
            <Button size="sm" className="text-[10px] uppercase font-bold tracking-widest gap-2 bg-accent text-accent-foreground hover:bg-accent/80">
              <Download className="w-3.0 h-3.0" /> Download PDF
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

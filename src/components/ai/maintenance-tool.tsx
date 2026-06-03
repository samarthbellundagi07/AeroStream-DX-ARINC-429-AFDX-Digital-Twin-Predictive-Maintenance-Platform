"use client";

import { useState } from "react";
import { aiBusAnomalyAnalyzer, AIBusAnomalyAnalyzerOutput } from "@/ai/flows/ai-bus-anomaly-analyzer";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export function MaintenanceTool({ currentAnomalies }: { currentAnomalies: any[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIBusAnomalyAnalyzerOutput | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const output = await aiBusAnomalyAnalyzer({
        busDataSummary: "Simulation running with multiple label activities and virtual links active. Observed slight latency spikes in AFDX stream.",
        anomalies: currentAnomalies.map(a => ({
          type: a.type,
          description: a.error || "System deviation detected",
          timestamp: a.timestamp,
          severity: 'High',
          dataContext: a.raw || `VL${a.vlid}`
        }))
      });
      setResult(output);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "AI Diagnostic service is currently unavailable.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-background/50 border-primary/20 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit className="w-24 h-24 text-primary" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-headline">AI Maintenance Diagnostic</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/50 p-3 rounded border">
                <span className="text-[10px] text-muted-foreground uppercase block mb-1">Severity Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-headline">{result.severityScore}%</span>
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-destructive transition-all" style={{ width: `${result.severityScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-secondary/50 p-3 rounded border">
                <span className="text-[10px] text-muted-foreground uppercase block mb-1">AI Confidence</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-headline">{result.confidenceScore}%</span>
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${result.confidenceScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-primary">Root Cause Assessment</h4>
              <ul className="space-y-1">
                {result.rootCauseSuggestions.map((cause, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-accent">Recommended Actions</h4>
              <ul className="space-y-1">
                {result.recommendedActions.map((action, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">Click below to analyze the current live stream for hidden mechanical anomalies and system failures.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runAnalysis} 
          disabled={loading} 
          className="w-full bg-primary hover:bg-primary/80 font-headline uppercase tracking-widest text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
          Execute AI Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { BusMetrics } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Gauge, Activity, Zap, Cpu } from "lucide-react";

interface PerformanceOscilloscopeProps {
  data: BusMetrics[];
}

export function PerformanceOscilloscope({ data }: PerformanceOscilloscopeProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Primary Bus Metrics */}
      <Card className="bg-card/10 hud-border border-primary/10 overflow-hidden">
        <CardHeader className="py-4 border-b border-border/30 bg-primary/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-xs font-headline uppercase tracking-[0.2em]">Bus Performance Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] p-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUtilization" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.3)" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                name="Throughput (Mbps)"
                type="monotone" 
                dataKey="throughput" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorThroughput)" 
                strokeWidth={2}
              />
              <Area 
                name="Utilization (%)"
                type="monotone" 
                dataKey="utilization" 
                stroke="hsl(var(--accent))" 
                fillOpacity={1} 
                fill="url(#colorUtilization)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency & Error Trends */}
      <Card className="bg-card/10 hud-border border-accent/10 overflow-hidden">
        <CardHeader className="py-4 border-b border-border/30 bg-accent/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent/20 rounded-lg">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-xs font-headline uppercase tracking-[0.2em]">Signal Integrity Trends</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] p-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.3)" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 15]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line 
                name="Latency (ms)"
                type="stepAfter" 
                dataKey="latency" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2} 
                dot={false} 
                animationDuration={300}
              />
              <Line 
                name="Error Rate (%)"
                type="monotone" 
                dataKey="errorRate" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3} 
                dot={false} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

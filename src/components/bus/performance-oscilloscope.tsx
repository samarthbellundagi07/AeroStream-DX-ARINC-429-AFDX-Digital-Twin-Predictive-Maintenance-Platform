"use client";

import { Arinc429Word, AfdxFrame } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import { Gauge } from "lucide-react";

interface PerformanceOscilloscopeProps {
  data: any[];
}

export function PerformanceOscilloscope({ data }: PerformanceOscilloscopeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-background/50 hud-border">
        <CardHeader className="py-3 flex flex-row items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-headline uppercase tracking-wider">Bus Throughput (Mbps)</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] p-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.5)" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Area type="monotone" dataKey="throughput" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorThroughput)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-background/50 hud-border">
        <CardHeader className="py-3 flex flex-row items-center gap-2">
          <Gauge className="w-4 h-4 text-accent" />
          <CardTitle className="text-sm font-headline uppercase tracking-wider">Average Latency (ms)</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] p-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.5)" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--accent))' }}
              />
              <Line type="stepAfter" dataKey="latency" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

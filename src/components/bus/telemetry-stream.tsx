"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Arinc429Word, AfdxFrame } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ShieldAlert, Wifi, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TelemetryStreamProps {
  arincWords: Arinc429Word[];
  afdxFrames: AfdxFrame[];
  type: 'ARINC' | 'AFDX';
}

export function TelemetryStream({ arincWords, afdxFrames, type }: TelemetryStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [sdiFilter, setSdiFilter] = useState("");

  const filteredArinc = useMemo(() => {
    return arincWords.filter(w => 
      (filter === "" || w.label.includes(filter)) && 
      (sdiFilter === "" || w.sdi === sdiFilter)
    );
  }, [arincWords, filter, sdiFilter]);

  const filteredAfdx = useMemo(() => {
    return afdxFrames.filter(f => 
      filter === "" || f.vlid.toString().includes(filter)
    );
  }, [afdxFrames, filter]);

  return (
    <Card className="h-full bg-card/10 hud-border flex flex-col overflow-hidden border-primary/10">
      <CardHeader className="py-4 border-b border-border/30 flex flex-row items-center justify-between shrink-0 bg-primary/5">
        <div className="flex items-center gap-3">
          {type === 'ARINC' ? <Wifi className="w-5 h-5 text-primary" /> : <Activity className="w-5 h-5 text-accent" />}
          <CardTitle className="text-xs font-headline uppercase tracking-[0.2em]">
            Engineering {type} Stream
          </CardTitle>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
             <Input 
              placeholder={type === 'ARINC' ? "Label (Octal)" : "VLID Filter"} 
              className="h-8 w-40 pl-8 text-[10px] font-headline bg-background/20 border-border/50 focus:border-primary/50" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
             />
          </div>
          {type === 'ARINC' && (
             <Input 
              placeholder="SDI" 
              className="h-8 w-12 text-[10px] font-headline bg-background/20 border-border/50 focus:border-primary/50 text-center px-0" 
              value={sdiFilter}
              onChange={(e) => setSdiFilter(e.target.value)}
             />
          )}
          <Badge variant="outline" className="font-mono text-[9px] animate-pulse text-accent border-accent/30 py-0 h-6">
            BUS_ENGAGED
          </Badge>
        </div>
      </CardHeader>

      <div className="grid grid-cols-12 bg-secondary/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2 px-4 border-b border-border/30">
        {type === 'ARINC' ? (
          <>
            <div className="col-span-2">TIMESTAMP</div>
            <div className="col-span-1">LBL</div>
            <div className="col-span-1">SDI</div>
            <div className="col-span-2">DATA FIELD</div>
            <div className="col-span-2">ENG VALUE</div>
            <div className="col-span-1">SSM</div>
            <div className="col-span-1 text-center">P</div>
            <div className="col-span-2 text-right">STATUS</div>
          </>
        ) : (
          <>
            <div className="col-span-2">TIMESTAMP</div>
            <div className="col-span-1">VLID</div>
            <div className="col-span-2">SEQ NUM</div>
            <div className="col-span-1 text-center">BAG</div>
            <div className="col-span-2 text-center">JITTER</div>
            <div className="col-span-2 text-center">LATENCY</div>
            <div className="col-span-2 text-right">INTEGRITY</div>
          </>
        )}
      </div>

      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <ScrollArea className="h-full w-full font-code text-[11px] leading-relaxed terminal-scroll">
          <div className="p-0">
            {type === 'ARINC' ? (
              filteredArinc.map((word) => (
                <div key={word.id} className={cn(
                  "grid grid-cols-12 items-center gap-2 py-2 px-4 border-b border-border/10 hover:bg-white/5 transition-colors",
                  !word.isValid && "bg-destructive/10 text-destructive font-bold"
                )}>
                  <span className="col-span-2 opacity-50">{new Date(word.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                  <span className="col-span-1 text-primary font-bold">{word.label}</span>
                  <span className="col-span-1 opacity-70">{word.sdi}</span>
                  <span className="col-span-2 font-mono truncate">{word.data}</span>
                  <span className="col-span-2 text-accent">{word.engineeringValue ? `${word.engineeringValue.toFixed(1)} ${word.unit}` : '---'}</span>
                  <span className={cn("col-span-1 font-bold", word.ssm === 'NCD' ? "text-yellow-500" : "text-accent")}>{word.ssm}</span>
                  <span className="col-span-1 text-center">{word.parity}</span>
                  <div className="col-span-2 text-right flex items-center justify-end gap-2">
                    {word.isValid ? <Badge variant="outline" className="text-[8px] py-0 border-accent/20 text-accent">OK</Badge> : <ShieldAlert className="w-3 h-3 text-destructive" />}
                  </div>
                </div>
              ))
            ) : (
              filteredAfdx.map((frame) => (
                <div key={frame.id} className={cn(
                  "grid grid-cols-12 items-center gap-2 py-2 px-4 border-b border-border/10 hover:bg-white/5 transition-colors",
                  (!frame.isValid || !frame.isCompliant) && "bg-destructive/10 text-destructive font-bold"
                )}>
                  <span className="col-span-2 opacity-50">{new Date(frame.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                  <span className="col-span-1 text-accent font-bold">VL{frame.vlid}</span>
                  <span className="col-span-2">SEQ: {frame.sequenceNumber}</span>
                  <span className="col-span-1 text-center">{frame.bag}ms</span>
                  <span className={cn("col-span-2 text-center", frame.jitter > 0.1 ? "text-destructive" : "text-accent")}>{frame.jitter.toFixed(3)}ms</span>
                  <span className="col-span-2 text-center">{frame.latency.toFixed(2)}ms</span>
                  <div className="col-span-2 text-right">
                    {(!frame.isValid || !frame.isCompliant) ? <ShieldAlert className="w-3 h-3 ml-auto" /> : <Badge variant="outline" className="text-[8px] py-0 border-accent/20 text-accent">NOMINAL</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

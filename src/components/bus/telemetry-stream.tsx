"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Arinc429Word, AfdxFrame } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ShieldAlert, Wifi, Filter, Search, ListFilter } from "lucide-react";
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [arincWords, afdxFrames]);

  return (
    <Card className="h-full bg-card/10 hud-border flex flex-col overflow-hidden border-primary/10">
      <CardHeader className="py-4 border-b border-border/30 flex flex-row items-center justify-between shrink-0 bg-primary/5">
        <div className="flex items-center gap-3">
          {type === 'ARINC' ? <Wifi className="w-5 h-5 text-primary" /> : <Activity className="w-5 h-5 text-accent" />}
          <CardTitle className="text-xs font-headline uppercase tracking-[0.2em]">
            Real-time {type} Stream
          </CardTitle>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
             <Input 
              placeholder={type === 'ARINC' ? "Filter Label (Octal)" : "Filter VLID"} 
              className="h-8 w-40 pl-8 text-[10px] font-headline bg-background/20 border-border/50 focus:border-primary/50" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
             />
          </div>
          {type === 'ARINC' && (
             <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input 
                  placeholder="SDI" 
                  className="h-8 w-20 pl-8 text-[10px] font-headline bg-background/20 border-border/50 focus:border-primary/50" 
                  value={sdiFilter}
                  onChange={(e) => setSdiFilter(e.target.value)}
                />
             </div>
          )}
          <Badge variant="outline" className="font-mono text-[9px] animate-pulse text-accent border-accent/30 py-0 h-6">
            BUS_ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <div className="grid grid-cols-12 bg-secondary/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2 px-4 border-b border-border/30">
        {type === 'ARINC' ? (
          <>
            <div className="col-span-2">TIMESTAMP</div>
            <div className="col-span-1">LBL</div>
            <div className="col-span-1">SDI</div>
            <div className="col-span-3">DATA FIELD (19-BIT)</div>
            <div className="col-span-1">SSM</div>
            <div className="col-span-1">P</div>
            <div className="col-span-3 text-right">RAW HEX</div>
          </>
        ) : (
          <>
            <div className="col-span-2">TIMESTAMP</div>
            <div className="col-span-1">VLID</div>
            <div className="col-span-2">SEQ NUM</div>
            <div className="col-span-1">BAG</div>
            <div className="col-span-3">PAYLOAD PREVIEW</div>
            <div className="col-span-3 text-right">CRC / STATUS</div>
          </>
        )}
      </div>

      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-scan z-10 pointer-events-none" />
        <ScrollArea className="h-full w-full font-code text-[11px] leading-relaxed terminal-scroll">
          <div className="p-0">
            {type === 'ARINC' ? (
              filteredArinc.length > 0 ? (
                filteredArinc.map((word) => (
                  <div key={word.id} className={cn(
                    "grid grid-cols-12 items-center gap-2 py-2 px-4 border-b border-border/10 hover:bg-white/5 transition-colors group",
                    !word.isValid && "bg-destructive/10 text-destructive font-bold"
                  )}>
                    <span className="col-span-2 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">{new Date(word.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                    <span className="col-span-1 text-primary font-bold">{word.label}</span>
                    <span className="col-span-1 opacity-70">{word.sdi}</span>
                    <span className="col-span-3 font-mono opacity-80">{word.data.match(/.{1,4}/g)?.join(' ')}</span>
                    <span className={cn("col-span-1 font-bold", word.ssm === 'NCD' ? "text-yellow-500" : "text-accent")}>{word.ssm}</span>
                    <span className="col-span-1">{word.parity}</span>
                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <span className="opacity-60">{word.raw}</span>
                      {!word.isValid && <ShieldAlert className="w-3 h-3 animate-pulse" />}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No matching ARINC words detected" />
              )
            ) : (
              filteredAfdx.length > 0 ? (
                filteredAfdx.map((frame) => (
                  <div key={frame.id} className={cn(
                    "grid grid-cols-12 items-center gap-2 py-2 px-4 border-b border-border/10 hover:bg-white/5 transition-colors group",
                    (!frame.isValid || !frame.isCompliant) && "bg-destructive/10 text-destructive font-bold"
                  )}>
                    <span className="col-span-2 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">{new Date(frame.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                    <span className="col-span-1 text-accent font-bold">VL{frame.vlid}</span>
                    <span className="col-span-2 opacity-70">SN: {frame.sequenceNumber}</span>
                    <span className="col-span-1">{frame.bag}ms</span>
                    <span className="col-span-3 font-mono truncate opacity-60 group-hover:opacity-100 transition-opacity">{frame.payload}</span>
                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <span className="opacity-40 text-[9px]">{frame.crc}</span>
                      {(!frame.isValid || !frame.isCompliant) && <ShieldAlert className="w-3 h-3 animate-pulse" />}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No matching AFDX frames detected" />
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground opacity-40">
       <ListFilter className="w-10 h-10 mb-4" />
       <p className="font-headline uppercase text-[10px] tracking-widest">{message}</p>
    </div>
  );
}

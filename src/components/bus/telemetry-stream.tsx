"use client";

import { useEffect, useRef, useState } from "react";
import { Arinc429Word, AfdxFrame } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ShieldAlert, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryStreamProps {
  arincWords: Arinc429Word[];
  afdxFrames: AfdxFrame[];
  type: 'ARINC' | 'AFDX';
}

export function TelemetryStream({ arincWords, afdxFrames, type }: TelemetryStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [arincWords, afdxFrames]);

  return (
    <Card className="h-full bg-background/50 hud-border flex flex-col overflow-hidden">
      <CardHeader className="py-3 border-b flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {type === 'ARINC' ? <Wifi className="w-4 h-4 text-primary" /> : <Activity className="w-4 h-4 text-accent" />}
          <CardTitle className="text-sm font-headline uppercase tracking-wider">
            Live {type} Telemetry
          </CardTitle>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] animate-pulse">
          CONNECTED
        </Badge>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-scan z-10 pointer-events-none" />
        <ScrollArea className="h-full w-full font-code text-[11px] leading-tight terminal-scroll">
          <div className="p-2 space-y-1">
            {type === 'ARINC' ? (
              arincWords.map((word) => (
                <div key={word.id} className={cn(
                  "flex items-center gap-4 py-1 px-2 rounded hover:bg-white/5 transition-colors",
                  !word.isValid && "bg-destructive/10 text-destructive border-l-2 border-destructive"
                )}>
                  <span className="text-muted-foreground w-20">{new Date(word.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                  <span className="text-primary font-bold w-12">{word.label}</span>
                  <span className="w-24">{word.raw}</span>
                  <span className="w-8">{word.ssm}</span>
                  <span className="flex-1 truncate opacity-80">SDI:{word.sdi} DATA:{word.data}</span>
                  {!word.isValid && <ShieldAlert className="w-3 h-3" />}
                </div>
              ))
            ) : (
              afdxFrames.map((frame) => (
                <div key={frame.id} className={cn(
                  "flex items-center gap-4 py-1 px-2 rounded hover:bg-white/5 transition-colors",
                  (!frame.isValid || !frame.isCompliant) && "bg-destructive/10 text-destructive border-l-2 border-destructive"
                )}>
                  <span className="text-muted-foreground w-20">{new Date(frame.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</span>
                  <span className="text-accent font-bold w-12">VL{frame.vlid}</span>
                  <span className="w-8">SEQ:{frame.sequenceNumber}</span>
                  <span className="w-24 truncate">{frame.payload}</span>
                  <span className="flex-1 text-right opacity-60">LEN:{frame.payloadSize} CRC:{frame.crc}</span>
                  {(!frame.isValid || !frame.isCompliant) && <ShieldAlert className="w-3 h-3" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

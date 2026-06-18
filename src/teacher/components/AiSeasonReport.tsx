"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SeasonReport {
  headline: string;
  narrative: string;
  topChanges: { title: string; impact: string }[];
  source: "ai" | "fallback";
}

export function AiSeasonReport() {
  const [report, setReport] = useState<SeasonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiConfigured, setAiConfigured] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/ai/season-report", {
        method: "POST",
      });
      const data = await res.json();
      setReport(data.report);
      setAiConfigured(data.aiConfigured);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle>AI Season Report</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <Badge variant={report.source === "ai" ? "default" : "secondary"}>
                {report.source === "ai" ? "Gemini" : "Offline mode"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={load}
              disabled={loading}
              aria-label="Regenerate report"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          AI-written analysis of your season&apos;s travel footprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !report ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your season…
          </div>
        ) : report ? (
          <>
            <p className="text-lg font-semibold">{report.headline}</p>
            {report.narrative.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
            {report.topChanges.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold">Top 3 high-impact changes</p>
                {report.topChanges.map((change, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <Badge className="shrink-0">{i + 1}</Badge>
                    <div>
                      <p className="text-sm font-medium">{change.title}</p>
                      <p className="text-xs text-primary">{change.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!aiConfigured && (
              <p className="text-xs text-muted-foreground">
                Set <code>GEMINI_API_KEY</code> in <code>.env.local</code> for
                AI-written reports. Showing computed insights for now.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Could not load the season report. Try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

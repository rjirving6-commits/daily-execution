"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCompany,
  getGoals,
  getDailySnapshot,
  saveBrief,
  generateId,
} from "@/lib/local-storage";
import type { Company, Goal, DailySnapshot } from "@/lib/local-storage";
import { BriefMarkdown } from "@/components/brief-markdown";
import { toast } from "sonner";
import { Zap, Loader2, Check } from "lucide-react";
import Link from "next/link";

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function BriefPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCompany(getCompany());
    setGoals(getGoals());
    setSnapshot(getDailySnapshot(today()));
  }, []);

  const generate = useCallback(async () => {
    if (!company || goals.length === 0 || !snapshot) return;

    setContent("");
    setStatus("streaming");
    setSaved(false);

    try {
      const res = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, goals, snapshot }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setContent(fullContent);
      }

      setStatus("done");

      // Auto-save
      const brief = {
        id: generateId(),
        date: today(),
        content: fullContent,
        createdAt: new Date().toISOString(),
      };
      saveBrief(brief);
      setSaved(true);
      toast.success("Brief generated and saved");
    } catch (err) {
      console.error("Brief generation failed:", err);
      setStatus("error");
      toast.error("Failed to generate brief");
    }
  }, [company, goals, snapshot]);

  const ready = company?.name && goals.length > 0 && snapshot;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Brief</h1>
          <p className="text-muted-foreground mt-1">{today()}</p>
        </div>
      </div>

      {/* Context summary */}
      {status === "idle" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Brief Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Company:</span>
              {company?.name ? (
                <Badge variant="secondary">{company.name} ({company.stage})</Badge>
              ) : (
                <Badge variant="destructive">
                  <Link href="/company">Set up company</Link>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Goals:</span>
              {goals.length > 0 ? (
                <Badge variant="secondary">{goals.length} goals</Badge>
              ) : (
                <Badge variant="destructive">
                  <Link href="/goals">Add goals</Link>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Snapshot:</span>
              {snapshot ? (
                <Badge variant="secondary">Today&apos;s data ready</Badge>
              ) : (
                <Badge variant="destructive">
                  <Link href="/daily">Enter daily metrics</Link>
                </Badge>
              )}
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                disabled={!ready}
                onClick={generate}
              >
                <Zap className="mr-2 h-4 w-4" /> Generate Today&apos;s Brief
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status bar during/after generation */}
      {status === "streaming" && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating your operator brief...
        </div>
      )}
      {status === "done" && saved && (
        <div className="flex items-center gap-2 mb-4 text-sm text-green-600">
          <Check className="h-4 w-4" />
          Brief generated and saved to history
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-destructive">
            Failed to generate brief. Check your OPENROUTER_API_KEY in .env.local
          </p>
          <Button variant="outline" onClick={generate}>
            Retry
          </Button>
        </div>
      )}

      {/* Brief content */}
      {content && (
        <Card>
          <CardContent className="pt-6">
            <BriefMarkdown content={content} />
          </CardContent>
        </Card>
      )}
    </main>
  );
}

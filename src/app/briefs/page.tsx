"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getBriefs } from "@/lib/local-storage";
import type { Brief } from "@/lib/local-storage";
import Link from "next/link";
import { FileText } from "lucide-react";

function extractPreview(content: string): string {
  // Try to find "Executive Truth" section and grab the first meaningful line
  const lines = content.split("\n").filter((l) => l.trim());
  const truthIdx = lines.findIndex((l) => l.toLowerCase().includes("executive truth"));
  if (truthIdx >= 0) {
    for (let i = truthIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith("#") && !line.startsWith("---")) {
        return line.slice(0, 200);
      }
    }
  }
  // Fallback: first non-heading line
  const first = lines.find((l) => !l.startsWith("#") && !l.startsWith("---"));
  return first?.slice(0, 200) ?? "Brief content";
}

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);

  useEffect(() => {
    setBriefs(getBriefs());
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Brief History</h1>
        <p className="text-muted-foreground mt-1">Past generated operator briefs</p>
      </div>

      {briefs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No briefs generated yet.</p>
            <p className="text-sm mt-1">
              <Link href="/brief" className="text-primary hover:underline">
                Generate your first brief
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {briefs.map((brief) => (
            <Link key={brief.id} href={`/briefs/${brief.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{brief.date}</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {extractPreview(brief.content)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(brief.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

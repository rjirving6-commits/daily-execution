"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBrief } from "@/lib/local-storage";
import type { Brief } from "@/lib/local-storage";
import { BriefSections } from "@/components/brief-markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BriefDetailPage() {
  const params = useParams();
  const [brief, setBrief] = useState<Brief | null>(null);

  useEffect(() => {
    const id = params.id as string;
    setBrief(getBrief(id));
  }, [params.id]);

  if (!brief) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <p className="text-muted-foreground">Brief not found.</p>
        <Button variant="link" asChild className="mt-2 px-0">
          <Link href="/briefs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to history
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/briefs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Brief &mdash; {brief.date}</h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
              Generated {new Date(brief.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Analysis Active
        </div>
      </div>

      <BriefSections content={brief.content} />
    </main>
  );
}

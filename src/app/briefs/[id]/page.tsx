"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBrief } from "@/lib/local-storage";
import type { Brief } from "@/lib/local-storage";
import { BriefMarkdown } from "@/components/brief-markdown";
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/briefs">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brief — {brief.date}</h1>
          <p className="text-sm text-muted-foreground">
            Generated {new Date(brief.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <BriefMarkdown content={brief.content} />
        </CardContent>
      </Card>
    </main>
  );
}

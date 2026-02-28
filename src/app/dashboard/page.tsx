"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCompany, getGoals, getDailySnapshot, getLatestSnapshot } from "@/lib/local-storage";
import { useEffect, useState } from "react";
import type { Company, Goal, DailySnapshot } from "@/lib/local-storage";
import { Building2, Target, BarChart3, Zap, ArrowRight } from "lucide-react";

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysSince(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function StalenessBadge({ days, type }: { days: number | null; type: "weekly" | "daily" }) {
  if (days === null) {
    return <Badge variant="destructive">Not set</Badge>;
  }
  if (type === "daily") {
    return days === 0 ? (
      <Badge variant="default" className="bg-green-600">Today</Badge>
    ) : (
      <Badge variant="destructive">{days}d ago</Badge>
    );
  }
  // weekly
  if (days < 3) return <Badge variant="default" className="bg-green-600">{days}d ago</Badge>;
  if (days < 7) return <Badge variant="secondary" className="bg-amber-500 text-white">{days}d ago</Badge>;
  return <Badge variant="destructive">{days}d ago</Badge>;
}

export default function DashboardPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todaySnapshot, setTodaySnapshot] = useState<DailySnapshot | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<DailySnapshot | null>(null);

  useEffect(() => {
    setCompany(getCompany());
    setGoals(getGoals());
    setTodaySnapshot(getDailySnapshot(toDateString(new Date())));
    setLatestSnapshot(getLatestSnapshot());
  }, []);

  const companyDays = daysSince(company?.updatedAt);
  const snapshotDays = latestSnapshot ? daysSince(latestSnapshot.date) : null;
  const hasToday = todaySnapshot !== null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {company?.name || "Daily Execution"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {company?.stage ? `${company.stage} — ` : ""}
            AI-powered operator briefs
          </p>
        </div>

        {/* Quick stats */}
        {company && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {company.monthlyBurn && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm text-muted-foreground">Burn</p>
                  <p className="text-lg font-semibold">{company.monthlyBurn}</p>
                </CardContent>
              </Card>
            )}
            {company.runway && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm text-muted-foreground">Runway</p>
                  <p className="text-lg font-semibold">{company.runway}</p>
                </CardContent>
              </Card>
            )}
            {latestSnapshot?.metrics.mrr && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-lg font-semibold">{latestSnapshot.metrics.mrr}</p>
                </CardContent>
              </Card>
            )}
            {latestSnapshot?.metrics.pipeline && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <p className="text-lg font-semibold">{latestSnapshot.metrics.pipeline}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Company context:</span>
            <StalenessBadge days={companyDays} type="weekly" />
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Daily snapshot:</span>
            <StalenessBadge days={snapshotDays} type="daily" />
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Goals:</span>
            {goals.length > 0 ? (
              <Badge variant="default" className="bg-green-600">{goals.length} set</Badge>
            ) : (
              <Badge variant="destructive">None</Badge>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generate Today&apos;s Brief
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!company?.name ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Set up your company profile first to generate a brief.
                </p>
                <Button asChild>
                  <Link href="/company">Set Up Company Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : goals.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add your goals to generate a brief.
                </p>
                <Button asChild>
                  <Link href="/goals">Add Goals <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : !hasToday ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter today&apos;s metrics to generate a brief.
                </p>
                <Button asChild>
                  <Link href="/daily">Enter Daily Snapshot <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              <Button asChild size="lg">
                <Link href="/brief">Generate Brief <Zap className="ml-2 h-4 w-4" /></Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/company" className="flex items-center gap-3">
              <Building2 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Company Profile</p>
                <p className="text-xs text-muted-foreground">Update weekly context</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/daily" className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Daily Metrics</p>
                <p className="text-xs text-muted-foreground">Enter today&apos;s numbers</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/briefs" className="flex items-center gap-3">
              <Target className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Brief History</p>
                <p className="text-xs text-muted-foreground">View past briefs</p>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarInput } from "@/components/ui/dollar-input";
import { PercentInput } from "@/components/ui/percent-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  getDailySnapshot,
  saveDailySnapshot,
  getLatestSnapshot,
  emptyMetrics,
  emptyQualitative,
} from "@/lib/local-storage";
import type { SnapshotMetrics, QualitativeSignals } from "@/lib/local-storage";
import { toast } from "sonner";
import { Save, ChevronDown } from "lucide-react";

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function DailyPage() {
  const [metrics, setMetrics] = useState<SnapshotMetrics>(emptyMetrics());
  const [qualitative, setQualitative] = useState<QualitativeSignals>(emptyQualitative());
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    revenue: true,
    conversion: false,
    product: false,
    retention: false,
    team: false,
    qualitative: true,
  });

  useEffect(() => {
    const todayDate = today();
    const existing = getDailySnapshot(todayDate);
    if (existing) {
      setMetrics(existing.metrics);
      setQualitative(existing.qualitative);
    } else {
      const latest = getLatestSnapshot();
      if (latest) {
        setMetrics(latest.metrics);
        setQualitative(emptyQualitative());
      }
    }
  }, []);

  function updateMetric(field: keyof SnapshotMetrics, value: string) {
    setMetrics((prev) => ({ ...prev, [field]: value }));
  }

  function updateQual(field: keyof QualitativeSignals, value: string) {
    setQualitative((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    const todayDate = today();
    saveDailySnapshot(todayDate, {
      date: todayDate,
      metrics,
      qualitative,
    });
    toast.success("Daily snapshot saved");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Snapshot</h1>
          <p className="text-muted-foreground mt-1">{today()}</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      <div className="space-y-4">
        {/* Revenue & Pipeline */}
        <Collapsible open={openSections.revenue} onOpenChange={() => toggleSection("revenue")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Revenue & Pipeline
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.revenue ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>MRR/ARR</Label>
                  <DollarInput value={metrics.mrr} onChange={(e) => updateMetric("mrr", e.target.value)} placeholder="8000" />
                </div>
                <div className="space-y-2">
                  <Label>Pipeline Value</Label>
                  <DollarInput value={metrics.pipeline} onChange={(e) => updateMetric("pipeline", e.target.value)} placeholder="180000" />
                </div>
                <div className="space-y-2">
                  <Label>Deals in Final Stage</Label>
                  <Input value={metrics.finalStageDeals} onChange={(e) => updateMetric("finalStageDeals", e.target.value)} placeholder="2 worth $70K" />
                </div>
                <div className="space-y-2">
                  <Label>New Opportunities This Week</Label>
                  <Input value={metrics.newOpportunities} onChange={(e) => updateMetric("newOpportunities", e.target.value)} placeholder="3" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Conversion & Sales */}
        <Collapsible open={openSections.conversion} onOpenChange={() => toggleSection("conversion")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Conversion & Sales
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.conversion ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Lead-to-Meeting Rate</Label>
                  <PercentInput value={metrics.leadToMeetingRate} onChange={(e) => updateMetric("leadToMeetingRate", e.target.value)} placeholder="4" />
                </div>
                <div className="space-y-2">
                  <Label>Meeting-to-Opportunity Rate</Label>
                  <PercentInput value={metrics.meetingToOpportunityRate} onChange={(e) => updateMetric("meetingToOpportunityRate", e.target.value)} placeholder="40" />
                </div>
                <div className="space-y-2">
                  <Label>Opportunity-to-Close Rate</Label>
                  <PercentInput value={metrics.opportunityToCloseRate} onChange={(e) => updateMetric("opportunityToCloseRate", e.target.value)} placeholder="25" />
                </div>
                <div className="space-y-2">
                  <Label>Average Sales Cycle</Label>
                  <Input value={metrics.avgSalesCycle} onChange={(e) => updateMetric("avgSalesCycle", e.target.value)} placeholder="45 days" />
                </div>
                <div className="space-y-2">
                  <Label>Win/Loss This Month</Label>
                  <Input value={metrics.winLoss} onChange={(e) => updateMetric("winLoss", e.target.value)} placeholder="3 / 2" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Product & Engagement */}
        <Collapsible open={openSections.product} onOpenChange={() => toggleSection("product")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Product & Engagement
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.product ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Active Users (DAU/WAU/MAU)</Label>
                  <Input value={metrics.activeUsers} onChange={(e) => updateMetric("activeUsers", e.target.value)} placeholder="150 / 400 / 1200" />
                </div>
                <div className="space-y-2">
                  <Label>Activation Rate</Label>
                  <PercentInput value={metrics.activationRate} onChange={(e) => updateMetric("activationRate", e.target.value)} placeholder="45" />
                </div>
                <div className="space-y-2">
                  <Label>Feature Adoption (Key Feature)</Label>
                  <PercentInput value={metrics.featureAdoption} onChange={(e) => updateMetric("featureAdoption", e.target.value)} placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label>NPS/CSAT</Label>
                  <Input value={metrics.nps} onChange={(e) => updateMetric("nps", e.target.value)} placeholder="45" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Retention & Churn */}
        <Collapsible open={openSections.retention} onOpenChange={() => toggleSection("retention")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Retention & Churn
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.retention ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Logo Churn (Monthly)</Label>
                  <PercentInput value={metrics.logoChurn} onChange={(e) => updateMetric("logoChurn", e.target.value)} placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label>Revenue Churn (Monthly)</Label>
                  <PercentInput value={metrics.revenueChurn} onChange={(e) => updateMetric("revenueChurn", e.target.value)} placeholder="1.5" />
                </div>
                <div className="space-y-2">
                  <Label>Expansion Revenue</Label>
                  <DollarInput value={metrics.expansionRevenue} onChange={(e) => updateMetric("expansionRevenue", e.target.value)} placeholder="2000" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Team & Capacity */}
        <Collapsible open={openSections.team} onOpenChange={() => toggleSection("team")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Team & Capacity
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.team ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Team Capacity</Label>
                  <select
                    value={metrics.teamCapacity}
                    onChange={(e) => updateMetric("teamCapacity", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    <option value="Overloaded">Overloaded</option>
                    <option value="At capacity">At capacity</option>
                    <option value="Have slack">Have slack</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Key Blockers</Label>
                  <Textarea value={metrics.blockers} onChange={(e) => updateMetric("blockers", e.target.value)} placeholder="What's stuck and why" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Open Roles in Pipeline</Label>
                  <Input value={metrics.openRoles} onChange={(e) => updateMetric("openRoles", e.target.value)} placeholder="2" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Qualitative Signals */}
        <Collapsible open={openSections.qualitative} onOpenChange={() => toggleSection("qualitative")}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-base">
                  Qualitative Signals (Last 48 Hours)
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.qualitative ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Customer Feedback Themes</Label>
                  <Textarea value={qualitative.customerFeedback} onChange={(e) => updateQual("customerFeedback", e.target.value)} placeholder="What you're hearing" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Lost Deal Reasons</Label>
                  <Textarea value={qualitative.lostDealReasons} onChange={(e) => updateQual("lostDealReasons", e.target.value)} placeholder="Why recent deals were lost" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Support Ticket Patterns</Label>
                  <Textarea value={qualitative.supportPatterns} onChange={(e) => updateQual("supportPatterns", e.target.value)} placeholder="What customers are asking about" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Team Concerns</Label>
                  <Textarea value={qualitative.teamConcerns} onChange={(e) => updateQual("teamConcerns", e.target.value)} placeholder="What your team is worried about" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Competitor Intel</Label>
                  <Textarea value={qualitative.competitorIntel} onChange={(e) => updateQual("competitorIntel", e.target.value)} placeholder="What you've observed" rows={2} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Daily Snapshot
          </Button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarInput } from "@/components/ui/dollar-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCompany, saveCompany } from "@/lib/local-storage";
import type { Company } from "@/lib/local-storage";
import { toast } from "sonner";
import { Save } from "lucide-react";

const emptyCompany: Company = {
  name: "",
  stage: "",
  monthlyBurn: "",
  bankBalance: "",
  icp: "",
  icpBudget: "",
  marketConditions: "",
  teamSize: "",
  updatedAt: "",
};

export default function CompanyPage() {
  const [form, setForm] = useState<Company>(emptyCompany);

  useEffect(() => {
    const saved = getCompany();
    if (saved) setForm(saved);
  }, []);

  function update(field: keyof Company, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    saveCompany(form);
    toast.success("Company profile saved");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground mt-1">Update weekly or when significant changes occur</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Acme Analytics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input id="stage" value={form.stage} onChange={(e) => update("stage", e.target.value)} placeholder="Seed / Series A / Bootstrapped" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Bank Balance</Label>
              <DollarInput id="balance" value={form.bankBalance} onChange={(e) => update("bankBalance", e.target.value)} placeholder="250000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="burn">Monthly Burn</Label>
              <DollarInput id="burn" value={form.monthlyBurn} onChange={(e) => update("monthlyBurn", e.target.value)} placeholder="18000" />
            </div>
            {form.bankBalance && form.monthlyBurn && Number(form.monthlyBurn) > 0 && (
              <div className="rounded-md bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">Runway: </span>
                <span className="font-semibold">
                  {Math.round((Number(form.bankBalance) / Number(form.monthlyBurn)) * 10) / 10} months
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icp">Ideal Customer Profile (ICP)</Label>
              <Textarea id="icp" value={form.icp} onChange={(e) => update("icp", e.target.value)} placeholder="VP of Operations at logistics companies, 200-2000 employees..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icpBudget">ICP Budget Range</Label>
              <Input id="icpBudget" value={form.icpBudget} onChange={(e) => update("icpBudget", e.target.value)} placeholder="$30K - $100K/year" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market">Current Market Conditions</Label>
              <Textarea id="market" value={form.marketConditions} onChange={(e) => update("marketConditions", e.target.value)} placeholder="Competitor moves, economic factors, timing windows..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="team">Team Size & Key Gaps</Label>
              <Textarea id="team" value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} placeholder="6 (2 eng, 1 design, 1 sales, 2 founders). Gap: No dedicated customer success." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Company Profile
          </Button>
        </div>
      </div>
    </main>
  );
}

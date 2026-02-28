"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getGoals, saveGoals, generateId } from "@/lib/local-storage";
import type { Goal } from "@/lib/local-storage";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const saved = getGoals();
    if (saved.length > 0) {
      setGoals(saved);
    }
  }, []);

  function addGoal() {
    if (goals.length >= 5) {
      toast.error("Maximum 5 goals");
      return;
    }
    setGoals((prev) => [
      ...prev,
      { id: generateId(), text: "", rank: prev.length + 1 },
    ]);
  }

  function removeGoal(id: string) {
    setGoals((prev) =>
      prev.filter((g) => g.id !== id).map((g, i) => ({ ...g, rank: i + 1 }))
    );
  }

  function updateText(id: string, text: string) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, text } : g)));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setGoals((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((g, i) => ({ ...g, rank: i + 1 }));
    });
  }

  function moveDown(index: number) {
    if (index >= goals.length - 1) return;
    setGoals((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((g, i) => ({ ...g, rank: i + 1 }));
    });
  }

  function handleSave() {
    const nonEmpty = goals.filter((g) => g.text.trim());
    if (nonEmpty.length === 0) {
      toast.error("Add at least one goal");
      return;
    }
    saveGoals(nonEmpty.map((g, i) => ({ ...g, rank: i + 1 })));
    toast.success("Goals saved");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Ranked 1-5 goals, stable for at least a quarter
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Priority Goals</span>
            <Button variant="outline" size="sm" onClick={addGoal} disabled={goals.length >= 5}>
              <Plus className="mr-1 h-4 w-4" /> Add Goal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No goals yet. Add up to 5 goals ranked by importance.
            </p>
          )}
          {goals.map((goal, index) => (
            <div key={goal.id} className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground w-8 text-center">
                G{index + 1}
              </span>
              <Input
                value={goal.text}
                onChange={(e) => updateText(goal.id, e.target.value)}
                placeholder={index === 0 ? "Your #1 goal — the one that matters most" : `Goal ${index + 1}`}
                className="flex-1"
              />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveDown(index)} disabled={index >= goals.length - 1}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeGoal(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" /> Save Goals
        </Button>
      </div>
    </main>
  );
}

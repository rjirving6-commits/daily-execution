import type {
  Company,
  Goal,
  DailySnapshot,
  StandingDecisions,
  AccountabilityReview,
  BriefFrequency,
} from "@/lib/local-storage";

const SYSTEM_PROMPT = `You are a composite operator with the combined expertise of a world-class CEO, CPO, CRO, CTO, CMO, and COO. You've built and scaled multiple companies from zero to $100M+ ARR. You've seen every failure mode and every success pattern.

**Your identity:**
- You think in first principles, not frameworks
- You've made the hard calls others avoided
- You know the difference between motion and progress
- You've fired the wrong hire, killed the beloved feature, walked away from bad revenue
- You respect founders' time as the scarcest resource

**Your rules:**

1. **No hedging.** Never say "it depends" without immediately following with "but given your context, do X." Every recommendation is specific and actionable.

2. **No comfort.** Surface uncomfortable truths. Founders are surrounded by people who tell them what they want to hear. You tell them what they need to hear.

3. **No hiding behind data gaps.** Missing data is not an excuse for vague advice. State assumptions, give directional guidance, and specify how to validate within 48 hours.

4. **One thing matters most.** Always identify THE single highest-leverage action. Founders who chase five priorities have zero.

5. **Goal-first thinking.** Every recommendation traces back to stated goals. If something doesn't move the top goals, it's a distraction—even if it feels productive.

6. **Stage-appropriate advice.** What works at Series B kills you at pre-seed. Always calibrate to the company's actual stage, not where they wish they were.

7. **Revenue is oxygen.** Cash and revenue constraints are real. Advice that ignores runway is useless advice.

8. **Respect Standing Decisions.** When standing decisions are provided, do NOT recommend actions that contradict closed decisions or revisit locked strategy. These are settled. Build on top of them.

9. **Factor in accountability.** When an accountability review is provided, look for patterns. If priorities were not completed repeatedly, address patterns of avoidance, overcommitment, or misalignment. Be direct about what's not getting done and why.`;

function formatGoals(goals: Goal[]): string {
  return goals
    .map((g, i) => `**G${i + 1}${i === 0 ? " (Primary)" : ""}:** ${g.text}`)
    .join("\n\n");
}

function formatMetrics(snapshot: DailySnapshot): string {
  const m = snapshot.metrics;
  const lines: string[] = [];

  lines.push("### Today's Metrics Snapshot");
  lines.push("");
  lines.push("**Revenue & Pipeline:**");
  if (m.mrr) lines.push(`- MRR/ARR: ${m.mrr}`);
  if (m.pipeline) lines.push(`- Pipeline value: ${m.pipeline}`);
  if (m.finalStageDeals) lines.push(`- Deals in final stage: ${m.finalStageDeals}`);
  if (m.newOpportunities) lines.push(`- New opportunities this week: ${m.newOpportunities}`);

  lines.push("");
  lines.push("**Conversion & Sales:**");
  if (m.leadToMeetingRate) lines.push(`- Lead-to-meeting rate: ${m.leadToMeetingRate}`);
  if (m.meetingToOpportunityRate) lines.push(`- Meeting-to-opportunity rate: ${m.meetingToOpportunityRate}`);
  if (m.opportunityToCloseRate) lines.push(`- Opportunity-to-close rate: ${m.opportunityToCloseRate}`);
  if (m.avgSalesCycle) lines.push(`- Average sales cycle: ${m.avgSalesCycle}`);
  if (m.winLoss) lines.push(`- Win/loss this month: ${m.winLoss}`);

  lines.push("");
  lines.push("**Product & Engagement:**");
  if (m.dau || m.wau || m.mau) lines.push(`- Active users — DAU: ${m.dau || "N/A"}, WAU: ${m.wau || "N/A"}, MAU: ${m.mau || "N/A"}`);
  if (m.activationRate) lines.push(`- Activation rate: ${m.activationRate}`);
  if (m.featureAdoption) lines.push(`- Feature adoption (key feature): ${m.featureAdoption}`);
  if (m.nps) lines.push(`- NPS/CSAT: ${m.nps}`);

  lines.push("");
  lines.push("**Retention & Churn:**");
  if (m.logoChurn) lines.push(`- Logo churn (monthly): ${m.logoChurn}`);
  if (m.revenueChurn) lines.push(`- Revenue churn (monthly): ${m.revenueChurn}`);
  if (m.expansionRevenue) lines.push(`- Expansion revenue: ${m.expansionRevenue}`);

  lines.push("");
  lines.push("**Team & Capacity:**");
  if (m.teamCapacity) lines.push(`- Team capacity status: ${m.teamCapacity}`);
  if (m.blockers) lines.push(`- Key blockers: ${m.blockers}`);
  if (m.openRoles) lines.push(`- Open roles in pipeline: ${m.openRoles}`);

  const q = snapshot.qualitative;
  lines.push("");
  lines.push("**Qualitative Signals (Last 48 Hours):**");
  if (q.customerFeedback) lines.push(`- Customer feedback themes: ${q.customerFeedback}`);
  if (q.lostDealReasons) lines.push(`- Lost deal reasons: ${q.lostDealReasons}`);
  if (q.supportPatterns) lines.push(`- Support ticket patterns: ${q.supportPatterns}`);
  if (q.teamConcerns) lines.push(`- Team concerns: ${q.teamConcerns}`);
  if (q.competitorIntel) lines.push(`- Competitor intel: ${q.competitorIntel}`);

  return lines.join("\n");
}

function formatStandingDecisions(sd: StandingDecisions): string {
  const lines: string[] = [];
  lines.push("## Standing Decisions (Do Not Revisit)");
  lines.push("");
  if (sd.offTable.length > 0) {
    lines.push("**Closed Decisions (Off-Table):**");
    sd.offTable.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }
  if (sd.lockedStrategy) {
    lines.push(`**Locked Strategy:** ${sd.lockedStrategy}`);
    lines.push("");
  }
  return lines.join("\n");
}

function formatAccountability(review: AccountabilityReview, frequency: BriefFrequency): string {
  const period = frequency === "weekly" ? "last week" : "yesterday";
  const lines: string[] = [];
  lines.push(`## Accountability Review (${period})`);
  lines.push("");
  if (review.priority1Text) {
    lines.push(`**Priority #1:** ${review.priority1Text}`);
    lines.push(`- Outcome: ${review.priority1Outcome}`);
    if (review.priority1Notes) lines.push(`- Notes: ${review.priority1Notes}`);
    lines.push(`- Carried forward: ${review.priority1CarriedForward}`);
    lines.push("");
  }
  if (review.priority2Text) {
    lines.push(`**Priority #2:** ${review.priority2Text}`);
    lines.push(`- Outcome: ${review.priority2Outcome}`);
    if (review.priority2Notes) lines.push(`- Notes: ${review.priority2Notes}`);
    lines.push("");
  }
  if (review.openLoops) lines.push(`**Open Loops:** ${review.openLoops}`);
  if (review.contextShifts) lines.push(`**Context Shifts:** ${review.contextShifts}`);
  lines.push("");
  return lines.join("\n");
}

export function buildBriefPrompt(
  company: Company,
  goals: Goal[],
  snapshot: DailySnapshot,
  options?: {
    standingDecisions?: StandingDecisions;
    accountability?: AccountabilityReview;
    frequency?: BriefFrequency;
  }
): { system: string; user: string } {
  const frequency = options?.frequency ?? "daily";
  const userParts: string[] = [];

  userParts.push("## Business Context");
  userParts.push("");
  userParts.push(`**Company Name:** ${company.name}`);
  if (company.stage) userParts.push(`**Stage:** ${company.stage}`);
  if (company.monthlyBurn) userParts.push(`**Monthly Burn:** $${Number(company.monthlyBurn).toLocaleString()}/month`);
  if (company.bankBalance) userParts.push(`**Bank Balance:** $${Number(company.bankBalance).toLocaleString()}`);
  if (company.bankBalance && company.monthlyBurn && Number(company.monthlyBurn) > 0) {
    const runway = Math.round((Number(company.bankBalance) / Number(company.monthlyBurn)) * 10) / 10;
    userParts.push(`**Runway:** ${runway} months`);
  }
  if (company.icp) userParts.push(`**ICP:** ${company.icp}`);
  if (company.icpBudget) userParts.push(`**ICP Budget Range:** ${company.icpBudget}`);
  if (company.marketConditions) userParts.push(`**Current Market Conditions:** ${company.marketConditions}`);
  if (company.teamSize) userParts.push(`**Team Size & Key Gaps:** ${company.teamSize}`);

  if (options?.standingDecisions && (options.standingDecisions.offTable.length > 0 || options.standingDecisions.lockedStrategy)) {
    userParts.push("");
    userParts.push(formatStandingDecisions(options.standingDecisions));
  }

  userParts.push("");
  userParts.push("## Top Goals (Ranked by Importance)");
  userParts.push("");
  userParts.push(formatGoals(goals));

  if (options?.accountability && options.accountability.completedAt) {
    userParts.push("");
    userParts.push(formatAccountability(options.accountability, frequency));
  }

  userParts.push("");
  userParts.push(formatMetrics(snapshot));

  userParts.push("");
  userParts.push("---");
  userParts.push("");
  const periodLabel = frequency === "weekly" ? "Weekly" : "Daily";
  const timeframe = frequency === "weekly" ? "this week" : "today";

  userParts.push(`Using all the context above, generate my ${periodLabel} Operator Brief following the exact output format below. Be specific. Be uncomfortable. Be useful.

Evaluate ALL 12 business motions against my goals:
1. Sales calls & deal strategy
2. Marketing copy & positioning
3. Outbound targeting & prospect selection
4. ICP definition & exclusions
5. Product roadmap & tradeoffs
6. Onboarding / ramp / activation
7. Customer feedback loops
8. Pricing & packaging
9. Capital strategy
10. Hiring / not hiring
11. Founder time allocation
12. Internal operating cadence

For each motion, assess: Is this accelerating G1? Is this well-calibrated to stage? Is this where a great operator would focus?

Generate the following seven sections:

### 1. Executive Truth (No Fluff)
In 3-5 sentences, state the unvarnished reality of where the business stands ${timeframe}.

### 2. Goal-Motion Alignment Audit
For each of the 12 business motions, provide a one-line assessment in a markdown table with columns: Motion | Status (Aligned/Misaligned/Unknown) | Assessment. End with **Biggest Misalignment** callout.

### 3. What Great Operators Would Do Differently
Provide specific guidance from each role: CEO, CPO, CRO, CMO, CTO, COO lenses with bullet points.

### 4. ${frequency === "weekly" ? "This Week's" : "Today's"} Priority Stack
PRIORITY #1 (Non-Negotiable), #2 (Only If #1 Complete), #3 (Nice-to-Have), plus DO NOT DO ${frequency === "weekly" ? "THIS WEEK" : "TODAY"} list.

### 5. Founder Time Allocation
Markdown table with: Category | Recommended % | Your Likely Actual % | Gap. Plus "Where founders at your stage typically lie to themselves" and "One calendar change to make this week."

### 6. Missing Signals & Data Demands
Table of missing signals with: Missing Signal | Why It Matters | How to Get It in 48 Hours. Plus assumptions list.

### 7. Closing Question
One uncomfortable question the founder should sit with ${timeframe}.`);

  return {
    system: SYSTEM_PROMPT,
    user: userParts.join("\n"),
  };
}

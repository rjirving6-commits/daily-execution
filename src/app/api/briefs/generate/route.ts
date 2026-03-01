import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { z } from "zod";
import { buildBriefPrompt } from "@/lib/prompts/operator-brief";

const requestSchema = z.object({
  company: z.object({
    name: z.string(),
    stage: z.string(),
    monthlyBurn: z.string(),
    bankBalance: z.string(),
    icp: z.string(),
    icpBudget: z.string(),
    marketConditions: z.string(),
    teamSize: z.string(),
    updatedAt: z.string(),
  }),
  goals: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      rank: z.number(),
    })
  ),
  snapshot: z.object({
    date: z.string(),
    metrics: z.object({
      mrr: z.string().default(""),
      pipeline: z.string().default(""),
      finalStageDeals: z.string().default(""),
      newOpportunities: z.string().default(""),
      leadToMeetingRate: z.string().default(""),
      meetingToOpportunityRate: z.string().default(""),
      opportunityToCloseRate: z.string().default(""),
      avgSalesCycle: z.string().default(""),
      winLoss: z.string().default(""),
      dau: z.string().default(""),
      wau: z.string().default(""),
      mau: z.string().default(""),
      activationRate: z.string().default(""),
      featureAdoption: z.string().default(""),
      nps: z.string().default(""),
      logoChurn: z.string().default(""),
      revenueChurn: z.string().default(""),
      expansionRevenue: z.string().default(""),
      teamCapacity: z.string().default(""),
      blockers: z.string().default(""),
      openRoles: z.string().default(""),
    }),
    qualitative: z.object({
      customerFeedback: z.string().default(""),
      lostDealReasons: z.string().default(""),
      supportPatterns: z.string().default(""),
      teamConcerns: z.string().default(""),
      competitorIntel: z.string().default(""),
    }),
  }),
  standingDecisions: z.object({
    offTable: z.array(z.string()),
    lockedStrategy: z.string(),
    updatedAt: z.string(),
  }).nullable().optional(),
  accountability: z.object({
    date: z.string(),
    priority1Text: z.string(),
    priority1Outcome: z.enum(["done", "partial", "not_done"]),
    priority1Notes: z.string(),
    priority1CarriedForward: z.enum(["same", "resolved", "deprioritized"]),
    priority2Text: z.string(),
    priority2Outcome: z.enum(["done", "partial", "not_done"]),
    priority2Notes: z.string(),
    openLoops: z.string(),
    contextShifts: z.string(),
    completedAt: z.string(),
  }).nullable().optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      console.error("[brief-generate] validation errors:", JSON.stringify(parsed.error.issues, null, 2));
      return Response.json({ error: "Invalid request payload", details: parsed.error.issues }, { status: 400 });
    }

    const { company, goals, snapshot, standingDecisions, accountability, frequency } = parsed.data;
    const { system, user } = buildBriefPrompt(company, goals, snapshot, {
      standingDecisions: standingDecisions ?? undefined,
      accountability: accountability ?? undefined,
      frequency: frequency ?? undefined,
    });

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const model = process.env.BRIEF_MODEL || "anthropic/claude-sonnet-4";

    const result = streamText({
      model: openrouter(model),
      system,
      prompt: user,
      maxOutputTokens: 8000,
      maxRetries: 1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[brief-generate] request failed", error);
    return Response.json(
      { error: "Unable to generate brief right now." },
      { status: 500 }
    );
  }
}

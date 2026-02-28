import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { z } from "zod";
import { buildBriefPrompt } from "@/lib/prompts/operator-brief";

const requestSchema = z.object({
  company: z.object({
    name: z.string(),
    stage: z.string(),
    monthlyBurn: z.string(),
    runway: z.string(),
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
      mrr: z.string(),
      pipeline: z.string(),
      finalStageDeals: z.string(),
      newOpportunities: z.string(),
      leadToMeetingRate: z.string(),
      meetingToOpportunityRate: z.string(),
      opportunityToCloseRate: z.string(),
      avgSalesCycle: z.string(),
      winLoss: z.string(),
      activeUsers: z.string(),
      activationRate: z.string(),
      featureAdoption: z.string(),
      nps: z.string(),
      logoChurn: z.string(),
      revenueChurn: z.string(),
      expansionRevenue: z.string(),
      teamCapacity: z.string(),
      blockers: z.string(),
      openRoles: z.string(),
    }),
    qualitative: z.object({
      customerFeedback: z.string(),
      lostDealReasons: z.string(),
      supportPatterns: z.string(),
      teamConcerns: z.string(),
      competitorIntel: z.string(),
    }),
  }),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { company, goals, snapshot } = parsed.data;
    const { system, user } = buildBriefPrompt(company, goals, snapshot);

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

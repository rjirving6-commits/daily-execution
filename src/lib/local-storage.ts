// ---- Types ----

export interface Company {
  name: string;
  stage: string;
  monthlyBurn: string;
  bankBalance: string;
  icp: string;
  icpBudget: string;
  marketConditions: string;
  teamSize: string;
  updatedAt: string; // ISO date string
}

export interface Goal {
  id: string;
  text: string;
  rank: number;
}

export interface SnapshotMetrics {
  mrr: string;
  pipeline: string;
  finalStageDeals: string;
  newOpportunities: string;
  leadToMeetingRate: string;
  meetingToOpportunityRate: string;
  opportunityToCloseRate: string;
  avgSalesCycle: string;
  winLoss: string;
  dau: string;
  wau: string;
  mau: string;
  activationRate: string;
  featureAdoption: string;
  nps: string;
  logoChurn: string;
  revenueChurn: string;
  expansionRevenue: string;
  teamCapacity: string;
  blockers: string;
  openRoles: string;
}

export interface QualitativeSignals {
  customerFeedback: string;
  lostDealReasons: string;
  supportPatterns: string;
  teamConcerns: string;
  competitorIntel: string;
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  metrics: SnapshotMetrics;
  qualitative: QualitativeSignals;
}

export interface Brief {
  id: string;
  date: string;
  content: string;
  createdAt: string; // ISO
}

// ---- Standing Decisions ----

export interface StandingDecisions {
  offTable: string[];
  lockedStrategy: string;
  updatedAt: string;
}

// ---- Accountability Review ----

export type PriorityOutcome = "done" | "partial" | "not_done";
export type CarryForward = "same" | "resolved" | "deprioritized";

export interface AccountabilityReview {
  date: string;
  priority1Text: string;
  priority1Outcome: PriorityOutcome;
  priority1Notes: string;
  priority1CarriedForward: CarryForward;
  priority2Text: string;
  priority2Outcome: PriorityOutcome;
  priority2Notes: string;
  openLoops: string;
  contextShifts: string;
  completedAt: string;
}

// ---- App Settings ----

export type BriefFrequency = "daily" | "weekly";

export interface AppSettings {
  briefFrequency: BriefFrequency;
}

// ---- Keys ----

const KEYS = {
  company: "de_company",
  goals: "de_goals",
  snapshots: "de_snapshots",
  briefs: "de_briefs",
  standingDecisions: "de_standing_decisions",
  accountability: "de_accountability",
  settings: "de_settings",
} as const;

// ---- Helpers ----

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Company ----

export function getCompany(): Company | null {
  return read<Company>(KEYS.company);
}

export function saveCompany(data: Company): void {
  write(KEYS.company, { ...data, updatedAt: new Date().toISOString() });
}

// ---- Goals ----

export function getGoals(): Goal[] {
  return read<Goal[]>(KEYS.goals) ?? [];
}

export function saveGoals(goals: Goal[]): void {
  write(KEYS.goals, goals);
}

// ---- Daily Snapshots ----

function getAllSnapshots(): Record<string, DailySnapshot> {
  return read<Record<string, DailySnapshot>>(KEYS.snapshots) ?? {};
}

export function getDailySnapshot(date: string): DailySnapshot | null {
  const all = getAllSnapshots();
  return all[date] ?? null;
}

export function saveDailySnapshot(date: string, data: DailySnapshot): void {
  const all = getAllSnapshots();
  all[date] = { ...data, date };
  write(KEYS.snapshots, all);
}

export function getSnapshots(): DailySnapshot[] {
  const all = getAllSnapshots();
  return Object.values(all).sort((a, b) => b.date.localeCompare(a.date));
}

export function getLatestSnapshot(): DailySnapshot | null {
  const sorted = getSnapshots();
  return sorted[0] ?? null;
}

// ---- Briefs ----

export function getBriefs(): Brief[] {
  const briefs = read<Brief[]>(KEYS.briefs) ?? [];
  return briefs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBrief(id: string): Brief | null {
  const briefs = getBriefs();
  return briefs.find((b) => b.id === id) ?? null;
}

export function saveBrief(brief: Brief): void {
  const briefs = read<Brief[]>(KEYS.briefs) ?? [];
  briefs.push(brief);
  write(KEYS.briefs, briefs);
}

// ---- Utility ----

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function emptyMetrics(): SnapshotMetrics {
  return {
    mrr: "",
    pipeline: "",
    finalStageDeals: "",
    newOpportunities: "",
    leadToMeetingRate: "",
    meetingToOpportunityRate: "",
    opportunityToCloseRate: "",
    avgSalesCycle: "",
    winLoss: "",
    dau: "",
    wau: "",
    mau: "",
    activationRate: "",
    featureAdoption: "",
    nps: "",
    logoChurn: "",
    revenueChurn: "",
    expansionRevenue: "",
    teamCapacity: "",
    blockers: "",
    openRoles: "",
  };
}

export function emptyQualitative(): QualitativeSignals {
  return {
    customerFeedback: "",
    lostDealReasons: "",
    supportPatterns: "",
    teamConcerns: "",
    competitorIntel: "",
  };
}

// ---- Standing Decisions ----

export function getStandingDecisions(): StandingDecisions | null {
  return read<StandingDecisions>(KEYS.standingDecisions);
}

export function saveStandingDecisions(data: StandingDecisions): void {
  write(KEYS.standingDecisions, { ...data, updatedAt: new Date().toISOString() });
}

// ---- Accountability Reviews ----

function getAllAccountability(): Record<string, AccountabilityReview> {
  return read<Record<string, AccountabilityReview>>(KEYS.accountability) ?? {};
}

export function getAccountabilityReview(date: string): AccountabilityReview | null {
  const all = getAllAccountability();
  return all[date] ?? null;
}

export function saveAccountabilityReview(date: string, data: AccountabilityReview): void {
  const all = getAllAccountability();
  all[date] = { ...data, date };
  write(KEYS.accountability, all);
}

// ---- App Settings ----

export function getAppSettings(): AppSettings {
  return read<AppSettings>(KEYS.settings) ?? { briefFrequency: "daily" };
}

export function saveAppSettings(settings: AppSettings): void {
  write(KEYS.settings, settings);
}

// ---- Brief Helpers ----

export function extractPrioritiesFromBrief(content: string): { priority1: string; priority2: string } {
  const p1Match = content.match(/PRIORITY\s*#1[^:]*:\s*(.+?)(?:\n|$)/i);
  const p2Match = content.match(/PRIORITY\s*#2[^:]*:\s*(.+?)(?:\n|$)/i);
  return {
    priority1: p1Match?.[1]?.trim().replace(/\*+/g, "").trim() ?? "",
    priority2: p2Match?.[1]?.trim().replace(/\*+/g, "").trim() ?? "",
  };
}

export function getPreviousBrief(beforeDate: string): Brief | null {
  const briefs = getBriefs();
  return briefs.find((b) => b.date < beforeDate) ?? null;
}

export function emptyAccountabilityReview(date: string): AccountabilityReview {
  return {
    date,
    priority1Text: "",
    priority1Outcome: "not_done",
    priority1Notes: "",
    priority1CarriedForward: "same",
    priority2Text: "",
    priority2Outcome: "not_done",
    priority2Notes: "",
    openLoops: "",
    contextShifts: "",
    completedAt: "",
  };
}

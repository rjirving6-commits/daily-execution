// ---- Types ----

export interface Company {
  name: string;
  stage: string;
  monthlyBurn: string;
  runway: string;
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
  activeUsers: string;
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

// ---- Keys ----

const KEYS = {
  company: "de_company",
  goals: "de_goals",
  snapshots: "de_snapshots",
  briefs: "de_briefs",
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
    activeUsers: "",
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

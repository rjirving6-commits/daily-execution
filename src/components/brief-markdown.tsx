"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Ban,
  Clock,
  Crosshair,
  Flame,
  HelpCircle,
  MessageSquareWarning,
  Search,
  Target,
  Users,
} from "lucide-react";

// ============================================================
// Section parsing
// ============================================================

interface BriefSection {
  heading: string;
  body: string;
}

function stripNumberPrefix(text: string): string {
  return text.replace(/^\d+\.\s*/, "");
}

function parseSections(content: string): BriefSection[] {
  const lines = content.split("\n");
  const sections: BriefSection[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentHeading || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = stripNumberPrefix(line.replace(/^###\s+/, "").replace(/\*\*/g, "").trim());
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading || currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }

  return sections;
}

// ============================================================
// Section identification
// ============================================================

type SectionType =
  | "executive-truth"
  | "alignment-audit"
  | "operators"
  | "priority-stack"
  | "time-allocation"
  | "missing-signals"
  | "closing-question"
  | "default";

function identifySection(heading: string): SectionType {
  const h = heading.toLowerCase();
  if (h.includes("executive truth")) return "executive-truth";
  if (h.includes("alignment audit") || h.includes("goal-motion")) return "alignment-audit";
  if (h.includes("operator") || h.includes("do differently")) return "operators";
  if (h.includes("priority stack") || h.includes("priority")) return "priority-stack";
  if (h.includes("time allocation") || h.includes("founder time")) return "time-allocation";
  if (h.includes("missing signal") || h.includes("data demand")) return "missing-signals";
  if (h.includes("closing question")) return "closing-question";
  return "default";
}

// ============================================================
// Section metadata (icons, subtitles, accent)
// ============================================================

const SECTION_META: Record<SectionType, {
  icon: React.ReactNode;
  subtitle?: string;
  accent: string;
}> = {
  "executive-truth": {
    icon: <Flame className="h-5 w-5 text-red-500" />,
    subtitle: "(No Fluff)",
    accent: "border-l-red-500",
  },
  "alignment-audit": {
    icon: <Crosshair className="h-5 w-5 text-violet-500" />,
    subtitle: undefined,
    accent: "border-l-violet-500",
  },
  operators: {
    icon: <Users className="h-5 w-5 text-sky-500" />,
    subtitle: undefined,
    accent: "border-l-sky-500",
  },
  "priority-stack": {
    icon: <Target className="h-5 w-5 text-blue-500" />,
    subtitle: undefined,
    accent: "border-l-blue-500",
  },
  "time-allocation": {
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    subtitle: undefined,
    accent: "border-l-amber-500",
  },
  "missing-signals": {
    icon: <Search className="h-5 w-5 text-orange-500" />,
    subtitle: undefined,
    accent: "border-l-orange-500",
  },
  "closing-question": {
    icon: <HelpCircle className="h-5 w-5 text-pink-500" />,
    subtitle: undefined,
    accent: "border-l-pink-500",
  },
  default: {
    icon: null,
    subtitle: undefined,
    accent: "border-l-primary",
  },
};

// ============================================================
// Status badge
// ============================================================

function StatusBadge({ text }: { text: string }) {
  const normalized = text.trim().toLowerCase();
  if (normalized === "aligned") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15">
        Aligned
      </Badge>
    );
  }
  if (normalized === "misaligned") {
    return (
      <Badge className="bg-red-500 text-white border-red-500 hover:bg-red-500/90">
        Misaligned
      </Badge>
    );
  }
  if (normalized === "unknown" || normalized === "unclear") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/15">
        {text.trim()}
      </Badge>
    );
  }
  return null;
}

// ============================================================
// Markdown components
// ============================================================

const markdownComponents: Components = {
  h1: (props) => <h1 className="mt-6 mb-3 text-2xl font-bold" {...props} />,
  h2: (props) => <h2 className="mt-5 mb-2 text-xl font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-4 mb-2 text-lg font-semibold" {...props} />,
  p: (props) => <p className="mb-3 leading-7 text-base text-foreground/90" {...props} />,
  ul: (props) => <ul className="mb-3 ml-5 list-disc space-y-1.5 text-base" {...props} />,
  ol: (props) => <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-base" {...props} />,
  li: (props) => <li className="leading-7 text-foreground/90" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-4 rounded-md border-l-4 border-primary bg-muted/50 py-3 pl-4 pr-3 text-base font-medium italic text-foreground"
      {...props}
    />
  ),
  code: ({ children, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    if (!match) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="mb-3 w-full overflow-x-auto rounded-md bg-muted p-3">
        <code className="text-sm leading-5 font-mono" {...props}>{children}</code>
      </pre>
    );
  },
  hr: (props) => <hr className="my-6 border-border" {...props} />,
  table: (props) => (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-muted/50" {...props} />,
  th: (props) => (
    <th className="border-b border-border px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" {...props} />
  ),
  td: ({ children, ...props }) => {
    const text = typeof children === "string" ? children.trim() : "";
    const STATUS_KEYWORDS = new Set(["aligned", "misaligned", "unknown", "unclear"]);
    const isStatus = STATUS_KEYWORDS.has(text.toLowerCase());
    return (
      <td className="border-b border-border/50 px-5 py-3.5" {...props}>
        {isStatus ? <StatusBadge text={text} /> : children}
      </td>
    );
  },
  strong: (props) => <strong className="font-bold text-foreground" {...props} />,
};

// ============================================================
// Parse labeled bullets: "**Label:** Description"
// ============================================================

function parseLabeledBullets(body: string): { label: string; text: string }[] {
  const items: { label: string; text: string }[] = [];
  const regex = /[-*]\s+\*\*([^:*]+)(?::?\*\*:?\s*|\*\*:\s*)(.+)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    items.push({ label: match[1].trim(), text: match[2].trim() });
  }
  return items;
}

// ============================================================
// Section-specific renderers
// ============================================================

// --- Executive Truth ---
function ExecutiveTruthSection({ body }: { body: string }) {
  return <BriefMarkdown content={body} />;
}

// --- Operators: role sub-cards ---
const ROLE_COLORS: Record<string, string> = {
  CEO: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  CPO: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  CRO: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  CMO: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  CTO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  COO: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
};

function OperatorsSection({ body }: { body: string }) {
  const items = parseLabeledBullets(body);
  if (items.length === 0) return <BriefMarkdown content={body} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map((item) => {
        const color = ROLE_COLORS[item.label] || "bg-muted text-foreground border-border";
        return (
          <div key={item.label} className={cn("rounded-lg border p-4 space-y-2", color)}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              {item.label}
            </div>
            <p className="text-sm leading-6 text-foreground">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}

// --- Priority Stack ---
const PRIORITY_STYLES: Record<string, { bg: string; icon: React.ReactNode }> = {
  "1": {
    bg: "bg-green-500/10 border-green-500/30",
    icon: <Target className="h-5 w-5 text-green-500" />,
  },
  "2": {
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: <Target className="h-5 w-5 text-amber-500" />,
  },
  "3": {
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: <Target className="h-5 w-5 text-blue-500" />,
  },
};

function PriorityStackSection({ body }: { body: string }) {
  const items = parseLabeledBullets(body);
  if (items.length === 0) return <BriefMarkdown content={body} />;

  const priorities: { label: string; text: string; num: string }[] = [];
  let doNotDo: string | null = null;

  for (const item of items) {
    const priorityMatch = item.label.match(/PRIORITY\s*#?(\d)/i);
    if (priorityMatch) {
      priorities.push({ ...item, num: priorityMatch[1] });
    } else if (item.label.toUpperCase().includes("DO NOT DO")) {
      doNotDo = item.text;
    } else {
      priorities.push({ ...item, num: "0" });
    }
  }

  return (
    <div className="space-y-3">
      {priorities.map((p) => {
        const style = PRIORITY_STYLES[p.num] || PRIORITY_STYLES["3"];
        const tagMatch = p.label.match(/\(([^)]+)\)/);
        const tag = tagMatch ? tagMatch[1] : null;
        return (
          <div key={p.num + p.label} className={cn("flex items-start gap-3 rounded-lg border p-4", style.bg)}>
            <div className="mt-0.5 shrink-0">{style.icon}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">Priority #{p.num}</span>
                {tag && (
                  <Badge variant="outline" className="text-xs font-medium">{tag}</Badge>
                )}
              </div>
              <p className="text-sm leading-6 text-foreground/90">{p.text}</p>
            </div>
          </div>
        );
      })}
      {doNotDo && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="min-w-0">
            <div className="font-bold text-sm text-destructive mb-1">DO NOT DO TODAY</div>
            <p className="text-sm leading-6 text-foreground/90">{doNotDo}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Closing Question ---
function ClosingQuestionSection({ body }: { body: string }) {
  const cleaned = body.replace(/^>\s*/gm, "").replace(/\*\*/g, "").trim();
  return (
    <div className="flex flex-col items-center text-center py-6 space-y-4">
      <MessageSquareWarning className="h-8 w-8 text-pink-500" />
      <p className="text-lg font-semibold leading-8 max-w-2xl italic text-foreground/90">
        &ldquo;{cleaned}&rdquo;
      </p>
    </div>
  );
}

// --- Missing Signals ---
function MissingSignalsSection({ body }: { body: string }) {
  const parts = body.split(/\*\*(?:Key )?Assumptions/i);
  const tablePart = parts[0];
  const assumptionsPart = parts.length > 1 ? "**Assumptions" + parts[1] : null;

  return (
    <div className="space-y-4">
      <BriefMarkdown content={tablePart} />
      {assumptionsPart && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <BriefMarkdown content={assumptionsPart} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Section renderer dispatch
// ============================================================

function renderSectionBody(type: SectionType, body: string) {
  switch (type) {
    case "executive-truth":
      return <ExecutiveTruthSection body={body} />;
    case "operators":
      return <OperatorsSection body={body} />;
    case "priority-stack":
      return <PriorityStackSection body={body} />;
    case "closing-question":
      return <ClosingQuestionSection body={body} />;
    case "missing-signals":
      return <MissingSignalsSection body={body} />;
    default:
      return <BriefMarkdown content={body} />;
  }
}

// ============================================================
// Section heading with icon
// ============================================================

function SectionHeading({
  heading,
  type,
}: {
  heading: string;
  type: SectionType;
}) {
  const meta = SECTION_META[type];
  // Extract a clean display title (remove parenthetical subtitle from heading)
  const displayTitle = heading.replace(/\s*\(.*?\)\s*$/, "").trim();
  // Try to extract subtitle from heading, or use default
  const headingSubtitle = heading.match(/\(([^)]+)\)/)?.[1];
  const subtitle = meta.subtitle || (headingSubtitle ? `(${headingSubtitle})` : undefined);

  return (
    <div className="flex items-center gap-2.5 mb-4">
      {meta.icon}
      <h2 className="text-xl font-bold tracking-tight">{displayTitle}</h2>
      {subtitle && (
        <span className="text-sm text-muted-foreground font-normal">{subtitle}</span>
      )}
    </div>
  );
}

// ============================================================
// Exports
// ============================================================

/** Render raw markdown (used during streaming) */
export function BriefMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-brief">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Render brief as sectioned layout (used for completed briefs) */
export function BriefSections({ content }: { content: string }) {
  const sections = parseSections(content);

  if (sections.length === 0 || (sections.length === 1 && !sections[0].heading)) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <BriefMarkdown content={content} />
      </div>
    );
  }

  // Desired display order
  const SECTION_ORDER: SectionType[] = [
    "executive-truth",
    "priority-stack",
    "operators",
    "alignment-audit",
    "time-allocation",
    "missing-signals",
    "closing-question",
  ];

  // Separate preamble from headed sections, then sort headed sections
  const preamble = sections.filter((s) => !s.heading);
  const headed = sections.filter((s) => s.heading);
  const sorted = [...headed].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(identifySection(a.heading));
    const bi = SECTION_ORDER.indexOf(identifySection(b.heading));
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  const ordered = [...preamble, ...sorted];

  // Sections where the body goes inside an accent-bordered container
  const ACCENTED_TYPES: SectionType[] = ["executive-truth"];

  return (
    <div className="space-y-10">
      {ordered.map((section, i) => {
        if (!section.heading && !section.body) return null;

        // Preamble (before first heading) — render as simple text
        if (!section.heading) {
          return (
            <div key={i}>
              <BriefMarkdown content={section.body} />
            </div>
          );
        }

        const type = identifySection(section.heading);
        const meta = SECTION_META[type];
        const isAccented = ACCENTED_TYPES.includes(type);

        return (
          <section key={i}>
            <SectionHeading heading={section.heading} type={type} />
            {isAccented ? (
              <div className={cn(
                "rounded-lg border bg-card p-6 border-l-4",
                meta.accent,
              )}>
                {renderSectionBody(type, section.body)}
              </div>
            ) : (
              renderSectionBody(type, section.body)
            )}
          </section>
        );
      })}
    </div>
  );
}

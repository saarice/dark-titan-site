// Illustrative sample data for the Factory dashboard. NOT real customer data.

export type Tone = "violet" | "cyan" | "green" | "amber";

export interface Metric {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  delta: string;
  tone: Tone;
}

export const METRICS: Metric[] = [
  { label: "Autonomous Tasks", value: 71, delta: "+12.2%", tone: "violet" },
  { label: "Tasks Completed", value: 64, delta: "+21.1%", tone: "cyan" },
  { label: "Success Rate", value: 98.6, suffix: "%", decimals: 1, delta: "+2.1%", tone: "green" },
  { label: "Deployments", value: 12, delta: "+4.1%", tone: "amber" },
];

export const AGENTS = ["Planner", "Builder", "Reviewer", "Tester", "Deployer"].map((name) => ({
  name,
  status: "Running" as const,
}));

// §5.6 — the darktitan · board ticket rows (verbatim PDF). Status text always
// shown (not color alone); colors map to signal tokens in ActivityList.
export const ACTIVITY = [
  { task: "DT-204 · Auth refactor", state: "RUNNING" as const, when: "now" },
  { task: "DT-205 · Payments API · P0", state: "QUEUED" as const, when: "2m ago" },
  { task: "DT-206 · Migrate schema", state: "BLOCKED" as const, when: "6m ago" },
  { task: "DT-201 · Release v2.3", state: "SHIPPED" as const, when: "12m ago" },
];

export const HEALTH = ["Compute", "Memory", "Agents", "Network"].map((name) => ({
  name,
  status: "Healthy" as const,
}));

export const THROUGHPUT = [120, 180, 150, 240, 300, 280, 360, 420, 390, 470, 520, 480, 540];
export const HOURS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];

export const NAV_ITEMS = [
  "Overview",
  "Factory",
  "Agents",
  "Workflows",
  "Codebases",
  "Deployments",
  "Observability",
  "Security",
  "Settings",
];

export const TONE_CLASS: Record<Tone, string> = {
  violet: "text-violet",
  cyan: "text-sig-cyan",
  green: "text-sig-green",
  amber: "text-sig-amber",
};

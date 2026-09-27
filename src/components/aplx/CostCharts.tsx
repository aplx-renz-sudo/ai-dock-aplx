/**
 * Cost, setup & ads charts for APLX Dock.
 *
 * APLX is a *dock* — a place to run your AI — not an AI model itself. These
 * charts show the dock costs $0 to download, $0 to run, gets you set up in
 * minutes, and serves zero ads, compared with the usual ways of wiring AI
 * tools together.
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ------------------------------- palette -------------------------------- */

const EMERALD = "#34d399";
const MUTED = "#3f3f46";
const GRID = "rgba(255,255,255,0.06)";
const AXIS = "#71717a";

const tooltipStyle = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 12,
  padding: "8px 10px",
} as const;

/* -------------------------------- data ---------------------------------- */

type Datum = { name: string; value: number };

// Is this the dock's own bar? (Highlighted in emerald.)
const isDock = (d: Datum) => d.name.startsWith("APLX");

// One-time cost to download / install the software (USD).
const DOWNLOAD_DATA: Datum[] = [
  { name: "APLX Dock", value: 0 },
  { name: "Paid AI apps", value: 25 },
  { name: "Premium suites", value: 60 },
];

// Monthly cost to keep everything running (USD / month).
const RUN_DATA: Datum[] = [
  { name: "APLX Dock", value: 0 },
  { name: "Single AI app", value: 20 },
  { name: "Stacked AI apps", value: 40 },
];

// Time from download to first run (minutes — lower is easier).
const SETUP_DATA: Datum[] = [
  { name: "APLX Dock", value: 2 },
  { name: "Typical AI app", value: 30 },
  { name: "Self-host stack", value: 120 },
];

// Ads served per active session across common free tools.
const ADS_DATA: Datum[] = [
  { name: "APLX Dock", value: 0 },
  { name: "Free AI apps", value: 14 },
  { name: "Web tools", value: 9 },
];

// Cumulative 12-month spend once you start using the dock.
const SPEND_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  aplx: 0,
  typical: (i + 1) * 20,
}));

/* ------------------------------ bar chart -------------------------------- */

function CostBars({
  data,
  unit,
  yTick,
  tooltipLabel,
}: {
  data: Datum[];
  unit: "usd" | "minutes" | "ads";
  yTick: (v: number) => string;
  tooltipLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yTick}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a1a1aa", marginBottom: 2 }}
          itemStyle={{ color: "#fafafa" }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value: number) => [
            unit === "usd" ? `$${value}` : unit === "minutes" ? `${value} min` : `${value}`,
            tooltipLabel,
          ]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((d) => (
            <Cell key={d.name} fill={isDock(d) ? EMERALD : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------- charts --------------------------------- */

export function DownloadChart() {
  return (
    <CostBars
      data={DOWNLOAD_DATA}
      unit="usd"
      yTick={(v) => `$${v}`}
      tooltipLabel="Cost to download"
    />
  );
}

export function RunChart() {
  return (
    <CostBars
      data={RUN_DATA}
      unit="usd"
      yTick={(v) => `$${v}`}
      tooltipLabel="Monthly cost to run"
    />
  );
}

export function SetupChart() {
  return (
    <CostBars
      data={SETUP_DATA}
      unit="minutes"
      yTick={(v) => `${v}m`}
      tooltipLabel="Setup time"
    />
  );
}

export function AdsChart() {
  return (
    <CostBars
      data={ADS_DATA}
      unit="ads"
      yTick={(v) => `${v}`}
      tooltipLabel="Ads per session"
    />
  );
}

export function SpendChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={SPEND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="aplxFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={EMERALD} stopOpacity={0.25} />
            <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a1a1aa", marginBottom: 2 }}
          itemStyle={{ color: "#fafafa" }}
          formatter={(value: number, name: string) => [
            `$${value}`,
            name === "aplx" ? "APLX Dock" : "Typical paid setup",
          ]}
        />
        <Area
          type="monotone"
          dataKey="typical"
          stroke={MUTED}
          strokeWidth={2}
          fill="transparent"
        />
        <Area
          type="monotone"
          dataKey="aplx"
          stroke={EMERALD}
          strokeWidth={2.5}
          fill="url(#aplxFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

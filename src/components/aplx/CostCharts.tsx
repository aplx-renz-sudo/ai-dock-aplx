/**
 * Cost & ads charts for APLX V2.
 * Data visualisations showing APLX V2 is free to use, free to download,
 * and serves zero ads compared with typical alternatives.
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

// Monthly subscription cost (USD) for comparable AI tools.
const COST_DATA = [
  { name: "APLX V2", cost: 0 },
  { name: "GPT Plus", cost: 20 },
  { name: "Claude Pro", cost: 20 },
  { name: "Gemini Adv.", cost: 20 },
  { name: "Copilot Pro", cost: 10 },
];

// Ads served per active session across common free tools.
const ADS_DATA = [
  { name: "APLX V2", ads: 0 },
  { name: "Free AI apps", ads: 14 },
  { name: "Web tools", ads: 9 },
  { name: "Mobile apps", ads: 18 },
];

// Cumulative 12-month spend once you start using the dock.
const SPEND_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  aplx: 0,
  typical: (i + 1) * 20,
}));

/* ------------------------------- charts --------------------------------- */

export function CostChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={COST_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a1a1aa", marginBottom: 2 }}
          itemStyle={{ color: "#fafafa" }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value: number) => [`$${value}`, "Monthly cost"]}
        />
        <Bar dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={44}>
          {COST_DATA.map((d) => (
            <Cell key={d.name} fill={d.cost === 0 ? EMERALD : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdsChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={ADS_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: AXIS, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a1a1aa", marginBottom: 2 }}
          itemStyle={{ color: "#fafafa" }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value: number) => [`${value}`, "Ads per session"]}
        />
        <Bar dataKey="ads" radius={[4, 4, 0, 0]} maxBarSize={44}>
          {ADS_DATA.map((d) => (
            <Cell key={d.name} fill={d.ads === 0 ? EMERALD : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
            name === "aplx" ? "APLX V2" : "Typical subscription",
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

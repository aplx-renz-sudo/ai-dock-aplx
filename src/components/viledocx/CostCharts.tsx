/**
 * The software-cost chart.
 *
 * This is deliberately the only chart on the page. An earlier version carried
 * four side-by-side comparisons against unnamed "paid AI apps" and had to
 * apologise for itself in a footnote; invented competitive data costs more
 * credibility than it buys. What remains is the one claim that is actually true
 * and checkable: the dock itself carries no licence fee, month after month.
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

/**
 * Cumulative software cost over 12 months. The comparison line models a
 * typical $20/month subscription — a round number, not a measured competitor.
 */
const SPEND_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  viledocx: 0,
  subscription: (i + 1) * 20,
}));

export function SpendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={SPEND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="viledocxFill" x1="0" y1="0" x2="0" y2="1">
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
            name === "viledocx" ? "VileDocx Dock licence" : "$20/mo subscription",
          ]}
        />
        <Area
          type="monotone"
          dataKey="subscription"
          stroke={MUTED}
          strokeWidth={2}
          fill="transparent"
        />
        <Area
          type="monotone"
          dataKey="viledocx"
          stroke={EMERALD}
          strokeWidth={2.5}
          fill="url(#viledocxFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

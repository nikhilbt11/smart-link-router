"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import type { PlatformDistribution } from "@/lib/services/analyticsService";

const PLATFORM_COLORS: Record<string, string> = {
  iOS: "#0ea5e9",
  Android: "#22c55e",
  Desktop: "#a855f7",
  Other: "#a1a1aa",
};

interface PlatformDistributionChartProps {
  distribution: PlatformDistribution;
  total: number;
}

export default function PlatformDistributionChart({ distribution, total }: PlatformDistributionChartProps) {
  const data = (Object.keys(distribution) as (keyof PlatformDistribution)[])
    .map((platform) => ({ platform, count: distribution[platform] }))
    .filter((entry) => entry.count > 0);

  if (total === 0) {
    return (
      <EmptyState
        title="No platform data yet"
        description="Platform distribution will appear here once clicks are recorded."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-56 w-full shrink-0 sm:w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="platform" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] ?? "#a1a1aa"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex-1 space-y-2 text-sm">
        {data.map((entry) => (
          <li key={entry.platform} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[entry.platform] ?? "#a1a1aa" }}
              />
              {entry.platform}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {entry.count} ({Math.round((entry.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import type { TimeSeriesPoint } from "@/lib/services/analyticsService";

export default function TimeSeriesChart({ data }: { data: TimeSeriesPoint[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No click data yet"
        description="Clicks over time will appear here once visitors use your smart links."
      />
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} width={32} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#18181b" fill="#18181b" fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
